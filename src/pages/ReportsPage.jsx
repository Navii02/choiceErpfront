import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ReportsPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await api.get('/reports/dashboard');
        if (!cancelled) setSummary(data.data);
      } catch (err) {
        if (!cancelled) setError('Could not load report data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <p className="eyebrow">Reports</p>
            <h1>ERP analytics</h1>
          </div>
        </div>
        <p className="muted">Loading report…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <div>
            <p className="eyebrow">Reports</p>
            <h1>ERP analytics</h1>
          </div>
        </div>
        <div className="error-box">{error}</div>
      </div>
    );
  }

  const s = summary || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>ERP analytics</h1>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Products</span>
          <strong>{s.totalProducts || 0}</strong>
        </div>
        <div className="stat-card">
          <span>Inventory</span>
          <strong>₹{Number(s.totalInventoryValue || 0).toLocaleString('en-IN')}</strong>
        </div>
        <div className="stat-card">
          <span>Low stock</span>
          <strong>{s.lowStockItems || 0}</strong>
        </div>
        <div className="stat-card">
          <span>Revenue</span>
          <strong>₹{Number(s.totalRevenue || 0).toLocaleString('en-IN')}</strong>
        </div>
      </div>

      {/* Sales panel — real numbers only, from API */}
      <div className="panel-grid">
        <div className="panel">
          <h3>Sales</h3>
          <ul className="list-plain">
            <li>Today: ₹{Number(s.todaySales || 0).toLocaleString('en-IN')}</li>
            <li>This month: ₹{Number(s.monthlySales || 0).toLocaleString('en-IN')}</li>
            <li>
              Best seller:{' '}
              {s.bestSeller
                ? `${s.bestSeller.name} (${s.bestSeller.qty} sold)`
                : 'No sales yet'}
            </li>
          </ul>
        </div>

        <div className="panel">
          <h3>Recent invoices</h3>
          {s.recentSales?.length ? (
            <ul className="list-plain">
              {s.recentSales.map((sale) => (
                <li key={sale._id}>
                  {sale.invoiceNumber} — ₹{Number(sale.grandTotal).toLocaleString('en-IN')}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No invoices recorded yet.</p>
          )}
        </div>
      </div>

      {/* Purchase panel removed — no backend endpoint exists yet */}
    </div>
  );
}