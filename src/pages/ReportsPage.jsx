import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ReportsPage() {
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalInventoryValue: 0,
    lowStockItems: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/reports/dashboard');
      setSummary(data.data || {});
    };
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>ERP analytics</h1>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><span>Products</span><strong>{summary.totalProducts}</strong></div>
        <div className="stat-card"><span>Inventory</span><strong>₹{Number(summary.totalInventoryValue || 0).toLocaleString('en-IN')}</strong></div>
        <div className="stat-card"><span>Low stock</span><strong>{summary.lowStockItems}</strong></div>
        <div className="stat-card"><span>Revenue</span><strong>₹{Number(summary.totalRevenue || 0).toLocaleString('en-IN')}</strong></div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3>Sales</h3>
          <ul className="list-plain">
            <li>Daily sales: ₹42,850</li>
            <li>Monthly sales: ₹2,57,300</li>
            <li>Best seller: Black Forest Cake</li>
          </ul>
        </div>
        <div className="panel">
          <h3>Purchase</h3>
          <ul className="list-plain">
            <li>Supplier payments pending: 8</li>
            <li>Raw material consumption: 340 kg</li>
            <li>Purchase variance: +5.2%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
