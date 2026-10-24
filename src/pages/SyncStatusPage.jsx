// pages/SyncStatusPage.jsx
import { useEffect, useState } from 'react';
import { getDb } from '../db/localDb';
import { syncAll, onSyncUpdate } from '../sync/syncEngine';
import { getLastSyncAt } from '../db/invoiceRepo';

export default function SyncStatusPage() {
  const [invoices, setInvoices] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [state, setState] = useState({ phase: 'idle' });

  const load = async () => {
    const db = await getDb();
    const all = await db.getAll('invoices');
    setInvoices(all.sort((a, b) => b.sequence - a.sequence));
    setLastSync(await getLastSyncAt());
  };

  useEffect(() => {
    load();
    const off = onSyncUpdate((s) => { setState(s); load(); });
    return off;
  }, []);

  return (
    <div>
      <div className="page-header">
        <p className="eyebrow">Sync</p>
        <h1>Offline invoice queue</h1>
      </div>
      <div className="panel">
        <div className="stats-grid secondary-grid">
          <div className="stat-card"><span>Last sync</span><strong>{lastSync || 'never'}</strong></div>
          <div className="stat-card"><span>Phase</span><strong>{state.phase}</strong></div>
          <div className="stat-card"><span>Pending</span><strong>{invoices.filter(i => i.syncStatus === 'pending').length}</strong></div>
          <div className="stat-card"><span>Failed</span><strong>{invoices.filter(i => i.syncStatus === 'failed' || i.syncStatus === 'conflict').length}</strong></div>
        </div>
        <button className="primary-button" onClick={() => syncAll()}>Sync all</button>

        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead>
              <tr><th>Local ID</th><th>Created</th><th>Total</th><th>Status</th><th>Attempts</th><th>Error</th></tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.clientInvoiceId}>
                  <td>{i.clientInvoiceId.slice(0, 8)}</td>
                  <td>{new Date(i.createdAt).toLocaleString()}</td>
                  <td>₹{i.totals.grandTotal}</td>
                  <td>{i.syncStatus}</td>
                  <td>{i.attempts || 0}</td>
                  <td>{i.lastError || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}