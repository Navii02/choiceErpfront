import { useEffect, useState } from 'react';
import api from '../services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });

  const loadData = async () => {
    const { data } = await api.get('/categories');
    setCategories(data.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await api.post('/categories', form);
    setForm({ name: '', description: '' });
    loadData();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Categories</p>
          <h1>Master data</h1>
        </div>
      </div>

      <div className="two-col-layout">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h3>Add category</h3>
          <label>
            Category name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Description
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <button type="submit" className="primary-button">Save category</button>
        </form>

        <div className="panel">
          <h3>Existing categories</h3>
          <div className="chip-list">
            {categories.map((category) => (
              <span key={category._id} className="chip">{category.name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
