import { openDB } from 'idb';

const DB_NAME = 'bakery-pos';
const DB_VERSION = 1;

let dbPromise;

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Pending + synced invoices (kept together for history)
        if (!db.objectStoreNames.contains('invoices')) {
          const store = db.createObjectStore('invoices', { keyPath: 'clientInvoiceId' });
          store.createIndex('syncStatus', 'syncStatus');       // pending | syncing | synced | failed | conflict
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('sequence', 'sequence', { unique: true });
        }

        // Cached products (for offline catalogue + stock snapshot)
        if (!db.objectStoreNames.contains('products')) {
          const store = db.createObjectStore('products', { keyPath: '_id' });
          store.createIndex('category', 'category._id');
          store.createIndex('updatedAt', 'updatedAt');
        }

        if (!db.objectStoreNames.contains('customers')) {
          db.createObjectStore('customers', { keyPath: '_id' });
        }

        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: '_id' });
        }

        // Meta: last sync time, sequence counter, deviceId
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// ---- meta helpers ----
export async function getMeta(key, fallback = null) {
  const db = await getDb();
  const row = await db.get('meta', key);
  return row ? row.value : fallback;
}

export async function setMeta(key, value) {
  const db = await getDb();
  await db.put('meta', { key, value });
}

// ---- device + sequence ----
export async function getDeviceId() {
  let id = await getMeta('deviceId');
  if (!id) {
    id = crypto.randomUUID();
    await setMeta('deviceId', id);
  }
  return id;
}

// Atomic-ish sequence via IDB transaction
export async function nextSequence() {
  const db = await getDb();
  const tx = db.transaction('meta', 'readwrite');
  const row = await tx.store.get('sequence');
  const next = (row?.value || 0) + 1;
  await tx.store.put({ key: 'sequence', value: next });
  await tx.done;
  return next;
}