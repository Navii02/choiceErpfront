import { useEffect, useState } from 'react';
import api from '../services/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', customerType: 'retail', address: '' });

  const loadData = async () => {
    const { data } = await api.get('/customers');
    setCustomers(data.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/customers', form);
    setForm({ name: '', phone: '', email: '', customerType: 'retail', address: '' });
    loadData();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Customers</p>
          <h1>Client records</h1>
        </div>
      </div>

      <div className="two-col-layout">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h3>Add customer</h3>
          <div className="form-grid">
            <label>
              Customer name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label>
              Email
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label>
              Type
              <select value={form.customerType} onChange={(e) => setForm({ ...form, customerType: e.target.value })}>
                <option value="walk_in">Walk-in</option>
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="corporate">Corporate</option>
              </select>
            </label>
            <label className="span-two">
              Address
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </label>
          </div>
          <button type="submit" className="primary-button">Save customer</button>
        </form>

        <div className="panel">
          <h3>Customer list</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td>{customer.name}</td>
                    <td>{customer.phone || '-'}</td>
                    <td>{customer.customerType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
