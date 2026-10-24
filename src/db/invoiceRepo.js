import { getDb, getDeviceId, nextSequence, getMeta, setMeta } from './localDb';

export async function enqueueInvoice({ items, customerId, paymentMethod, totals }) {
  const db = await getDb();
  const deviceId = await getDeviceId();
  const sequence = await nextSequence();

  const invoice = {
    clientInvoiceId: crypto.randomUUID(),
    deviceId,
    sequence,
    items,
    customerId: customerId || null,
    paymentMethod: paymentMethod || 'cash',
    totals,
    createdAt: new Date().toISOString(),
    syncStatus: 'pending',
    attempts: 0,
    lastError: null,
    serverResponse: null,
  };

  await db.put('invoices', invoice);
  return invoice;
}

export async function listPendingInvoices(limit = 100) {
  const db = await getDb();
  const idx = db.transaction('invoices').store.index('syncStatus');
  const pending = await idx.getAll('pending');
  const failed  = await idx.getAll('failed');
  return [...pending, ...failed]
    .sort((a, b) => a.sequence - b.sequence)
    .slice(0, limit);
}

export async function markSyncing(ids) {
  const db = await getDb();
  const tx = db.transaction('invoices', 'readwrite');
  for (const id of ids) {
    const inv = await tx.store.get(id);
    if (inv) await tx.store.put({ ...inv, syncStatus: 'syncing' });
  }
  await tx.done;
}

/** ✅ Revert a stuck `syncing` row back to `pending` (used on auth abort). */
export async function markPending(id) {
  const db = await getDb();
  const inv = await db.get('invoices', id);
  if (!inv) return;
  if (inv.syncStatus !== 'syncing') return;
  await db.put('invoices', { ...inv, syncStatus: 'pending' });
}

export async function markSynced(id, serverResponse) {
  const db = await getDb();
  const inv = await db.get('invoices', id);
  if (!inv) return;
  await db.put('invoices', {
    ...inv,
    syncStatus: 'synced',
    syncedAt: new Date().toISOString(),
    serverResponse,
    lastError: null,
  });
}

export async function markFailed(id, error, { conflict = false } = {}) {
  const db = await getDb();
  const inv = await db.get('invoices', id);
  if (!inv) return;
  await db.put('invoices', {
    ...inv,
    syncStatus: conflict ? 'conflict' : 'failed',
    attempts: (inv.attempts || 0) + 1,
    lastError: typeof error === 'string' ? error : (error?.message || 'Unknown error'),
  });
}

export async function countByStatus() {
  const db = await getDb();
  const all = await db.getAll('invoices');
  return all.reduce((acc, inv) => {
    acc[inv.syncStatus] = (acc[inv.syncStatus] || 0) + 1;
    return acc;
  }, {});
}

export async function getLastSyncAt() {
  return getMeta('lastSyncAt', null);
}

export async function setLastSyncAt(iso) {
  return setMeta('lastSyncAt', iso);
}