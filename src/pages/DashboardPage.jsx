import { useEffect, useState } from 'react';
import api from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);   // ← null = not loaded yet
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await api.get('/reports/dashboard');
        if (!cancelled) setStats(data.data);
      } catch (err) {
        if (!cancelled) setError('Could not load dashboard data.');
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
            <p className="eyebrow">Dashboard</p>
            <h1>Bakery overview</h1>
          </div>
        </div>
        <p className="muted">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Bakery overview</h1>
          </div>
        </div>
        <div className="error-box">{error}</div>
      </div>
    );
  }

  const sales = stats || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Bakery overview</h1>
        </div>
      </div>

      {/* Money cards — all from API, no defaults */}
      <div className="stats-grid">
        <div className="stat-card">
          <span>Today sales</span>
          <strong>₹{Number(sales.todaySales || 0).toLocaleString('en-IN')}</strong>
        </div>
        <div className="stat-card">
          <span>This month</span>
          <strong>₹{Number(sales.monthlySales || 0).toLocaleString('en-IN')}</strong>
        </div>
        <div className="stat-card">
          <span>Total revenue</span>
          <strong>₹{Number(sales.totalRevenue || 0).toLocaleString('en-IN')}</strong>
        </div>
        <div className="stat-card">
          <span>Best seller</span>
          <strong>
            {sales.bestSeller
              ? `${sales.bestSeller.name} (${sales.bestSeller.qty})`
              : '—'}
          </strong>
        </div>
      </div>

      {/* Inventory cards — from API */}
      <div className="stats-grid secondary-grid">
        <div className="stat-card">
          <span>Total products</span>
          <strong>{sales.totalProducts || 0}</strong>
        </div>
        <div className="stat-card">
          <span>Inventory value</span>
          <strong>₹{Number(sales.totalInventoryValue || 0).toLocaleString('en-IN')}</strong>
        </div>
        <div className="stat-card">
          <span>Low stock items</span>
          <strong>{sales.lowStockItems || 0}</strong>
        </div>
      </div>

      {/* Recent sales — from API, empty state if none */}
      <div className="panel-grid">
        <div className="panel">
          <h3>Recent sales</h3>
          {sales.recentSales?.length ? (
            <ul className="list-plain">
              {sales.recentSales.map((s) => (
                <li key={s._id}>
                  {s.invoiceNumber} — ₹{Number(s.grandTotal).toLocaleString('en-IN')}
                  {' · '}
                  {s.customerName}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No sales recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}