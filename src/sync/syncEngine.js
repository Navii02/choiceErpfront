import api from '../services/api';
import {
  listPendingInvoices, markSyncing, markSynced, markFailed,
  getLastSyncAt, setLastSyncAt, countByStatus,
} from '../db/invoiceRepo';

const SYNC_INTERVAL_MS = 2 * 60 * 60 * 1000;     // 2 hours
const BATCH_SIZE = 25;
const MAX_ATTEMPTS = 5;

let timer = null;
let running = false;
const listeners = new Set();

export function onSyncUpdate(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function emit(payload) { listeners.forEach((fn) => fn(payload)); }

/** Sync one batch. Returns { synced, failed, conflicts, done } */
export async function syncOnce() {
  if (running) return { skipped: true };
  running = true;

  try {
    const invoices = await listPendingInvoices(BATCH_SIZE);
    if (invoices.length === 0) {
      emit({ phase: 'idle', counts: await countByStatus() });
      return { synced: 0, failed: 0, conflicts: 0, done: true };
    }

    await markSyncing(invoices.map((i) => i.clientInvoiceId));
    emit({ phase: 'syncing', total: invoices.length });

    let synced = 0, failed = 0, conflicts = 0;

    for (const inv of invoices) {
      if ((inv.attempts || 0) >= MAX_ATTEMPTS) {
        await markFailed(inv.clientInvoiceId, 'Max attempts exceeded', { conflict: true });
        conflicts++;
        continue;
      }

      try {
        const { data } = await api.post('/sales/pos', {
          // backend contract additions:
          clientInvoiceId: inv.clientInvoiceId,
          deviceId: inv.deviceId,
          sequence: inv.sequence,
          createdAt: inv.createdAt,
          customerId: inv.customerId,
          paymentMethod: inv.paymentMethod,
          items: inv.items.map((i) => ({ productId: i.productId, quantity: i.qty })),
          allowNegativeStock: true,       // ← see backend section
        });
        await markSynced(inv.clientInvoiceId, data.data);
        synced++;
      } catch (err) {
        const status = err?.response?.status;
        const conflict = status === 409 || status === 422;
        await markFailed(inv.clientInvoiceId, err, { conflict });
        if (conflict) conflicts++; else failed++;
      }
    }

    await setLastSyncAt(new Date().toISOString());
    emit({ phase: 'done', synced, failed, conflicts, counts: await countByStatus() });
    return { synced, failed, conflicts, done: invoices.length < BATCH_SIZE };
  } finally {
    running = false;
  }
}

/** Drain queue until empty or stop on error. */
export async function syncAll() {
  let result;
  let guard = 0;
  do {
    result = await syncOnce();
    guard++;
    if (result.skipped) break;
    if (result.failed > 0 || result.conflicts > 0) break; // stop on human-action-needed
  } while (!result.done && guard < 100);
  return result;
}

/** Start interval + online/visibility watchers. */
export function startSyncEngine() {
  if (timer) return;

  // Initial + on reconnect
  syncAll().catch(() => {});
  window.addEventListener('online', () => syncAll().catch(() => {}));

  // Safety: if tab was sleeping, sync on wake
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncAll().catch(() => {});
  });

  // Try to sync before unload
  window.addEventListener('beforeunload', () => {
    // best-effort; batches already attempted
  });

  timer = setInterval(() => syncAll().catch(() => {}), SYNC_INTERVAL_MS);
}

export function stopSyncEngine() {
  if (timer) { clearInterval(timer); timer = null; }
}