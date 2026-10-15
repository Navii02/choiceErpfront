import { useEffect, useState } from 'react';
import api from '../services/api';

export default function InventoryPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/inventory/summary');
      setRows(data.data || []);
    };
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1>Stock overview</h1>
        </div>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Reorder</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id}>
                  <td>{row.name}</td>
                  <td>{row.category}</td>
                  <td>{row.stockOnHand}</td>
                  <td>{row.minimumStock}</td>
                  <td>{row.stockOnHand <= row.minimumStock ? 'Low stock' : 'Healthy'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
