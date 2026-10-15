import { useEffect, useState } from 'react';
import api from '../services/api';

const cards = [
  { label: 'Today sales', key: 'sales' },
  { label: 'Today purchases', key: 'purchases' },
  { label: 'Expenses', key: 'expenses' },
  { label: 'Profit', key: 'profit' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    sales: 42850,
    purchases: 23850,
    expenses: 6200,
    profit: 16800,
    totalProducts: 0,
    totalInventoryValue: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/reports/dashboard');
        setStats((prev) => ({ ...prev, ...data.data }));
      } catch (error) {
        console.error('Dashboard fetch failed', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Bakery overview</h1>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.key}>
            <span>{card.label}</span>
            <strong>₹{Number(stats[card.key] || 0).toLocaleString('en-IN')}</strong>
          </div>
        ))}
      </div>

      <div className="stats-grid secondary-grid">
        <div className="stat-card">
          <span>Total products</span>
          <strong>{stats.totalProducts || 0}</strong>
        </div>
        <div className="stat-card">
          <span>Inventory value</span>
          <strong>₹{Number(stats.totalInventoryValue || 0).toLocaleString('en-IN')}</strong>
        </div>
        <div className="stat-card">
          <span>Low stock items</span>
          <strong>{stats.lowStockItems || 0}</strong>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3>Recent sales</h3>
          <ul className="list-plain">
            <li>Black Forest Cake — ₹650</li>
            <li>Chocolate Puff — ₹120</li>
            <li>Birthday Cake — ₹1850</li>
          </ul>
        </div>
        <div className="panel">
          <h3>Production status</h3>
          <ul className="list-plain">
            <li>12 orders in production</li>
            <li>4 batches due today</li>
            <li>2 high-priority expiries</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
