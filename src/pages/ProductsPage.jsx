import { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Save, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';

const emptyForm = {
  name: '',
  sku: '',
  category: '',
  unit: '',
  sellingPrice: 0,
  costPrice: 0,
  minimumStock: 0,
  maximumStock: 0,
  reorderLevel: 0,
  openingStock: 0,        // ← create-only
  productType: 'finished_product',
  status: 'active',
  image: '',
  description: '',
};

export default function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [adjustingId, setAdjustingId] = useState(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, u, p] = await Promise.all([
        api.get('/categories'),
        api.get('/units'),
        api.get('/products'),
      ]);
      setCategories(c.data.data || []);
      setUnits(u.data.data || []);
      setProducts(p.data.data || []);
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category?._id || product.category || '',
      unit: product.unit?._id || product.unit || '',
      sellingPrice: product.sellingPrice || 0,
      costPrice: product.costPrice || 0,
      minimumStock: product.minimumStock || 0,
      maximumStock: product.maximumStock || 0,
      reorderLevel: product.reorderLevel || 0,
      openingStock: 0,                       // irrelevant in edit mode
      productType: product.productType || 'finished_product',
      status: product.status || 'active',
      image: product.image || '',
      description: product.description || '',
    });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingId) {
        // Strip fields that must not be overwritten on update
        const { openingStock, ...updatePayload } = form;
        await api.put(`/products/${editingId}`, updatePayload);
      } else {
        await api.post('/products', form);
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (editingId ? 'Failed to update product.' : 'Failed to create product.')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product._id);
    setError('');
    try {
      await api.delete(`/products/${product._id}`);
      if (editingId === product._id) resetForm();
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdjustStock = async (product) => {
    const raw = window.prompt(
      `Adjust stock for "${product.name}"\nCurrent: ${product.stockOnHand || 0}\n\nEnter a positive number to add, negative to remove (e.g. 10 or -3):`,
      '0'
    );
    if (raw === null) return;                 // cancelled
    const quantity = Number(raw);
    if (!Number.isFinite(quantity) || quantity === 0) {
      alert('Please enter a non-zero number.');
      return;
    }

    setAdjustingId(product._id);
    setError('');
    try {
      await api.post('/inventory/adjust', {
        productId: product._id,
        quantity,
        reason: 'manual-adjustment',
      });
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to adjust stock.');
    } finally {
      setAdjustingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Products</p>
          <h1>Catalog management</h1>
        </div>
      </div>

      <div className="two-col-layout">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-header-row">
            <h3>{editingId ? 'Edit product' : 'Add product'}</h3>
            {editingId && (
              <button type="button" className="link-button" onClick={resetForm}>
                <X size={14} /> Cancel edit
              </button>
            )}
          </div>

          <div className="form-grid">
            <label>
              Product name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              SKU
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </label>
            <label>
              Unit
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required>
                <option value="">Select unit</option>
                {units.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </label>
            <label>
              Selling price
              <input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })} />
            </label>
            <label>
              Cost price
              <input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} />
            </label>

            {/* ---- Stock metadata ---- */}
            <label>
              Minimum stock
              <input type="number" value={form.minimumStock} onChange={(e) => setForm({ ...form, minimumStock: Number(e.target.value) })} />
            </label>
            <label>
              Maximum stock
              <input type="number" value={form.maximumStock} onChange={(e) => setForm({ ...form, maximumStock: Number(e.target.value) })} />
            </label>
            <label>
              Reorder level
              <input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} />
            </label>

            {/* ---- Opening stock (create only) ---- */}
            {!editingId && (
              <label>
                Opening stock
                <input
                  type="number"
                  value={form.openingStock}
                  onChange={(e) => setForm({ ...form, openingStock: Number(e.target.value) })}
                />
                <small>One-time initial quantity. Use “Adjust stock” later for corrections.</small>
              </label>
            )}

            <label>
              Product type
              <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })}>
                <option value="finished_product">Finished product</option>
                <option value="raw_material">Raw material</option>
                <option value="semi_finished">Semi finished</option>
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <label className="span-two">
              Product image URL
              <input type="url" value={form.image} placeholder="https://example.com/product-image.jpg" onChange={(e) => setForm({ ...form, image: e.target.value })} />
              <small>Use a public, direct image URL. The image is displayed from its source and is not uploaded.</small>
            </label>
            <label className="span-two">
              Description
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
          </div>

          {error && <div className="error-box">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving…' : editingId ? 'Update product' : 'Save product'}
            </button>
            {editingId && (
              <button type="button" className="pill" onClick={resetForm} disabled={saving}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="panel">
          <h3>Product list</h3>

          {loading ? (
            <p className="muted">Loading…</p>
          ) : products.length === 0 ? (
            <p className="muted">No products yet. Add one using the form.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const stock = product.stockOnHand || 0;
                    const min = product.minimumStock || 0;
                    const low = stock <= min;
                    return (
                      <tr key={product._id} className={editingId === product._id ? 'is-editing' : ''}>
                        <td data-label="Name">{product.name}</td>
                        <td data-label="SKU">{product.sku}</td>
                        <td data-label="Price">₹{product.sellingPrice}</td>
                        <td data-label="Stock">
                          <span className={`stock-badge ${low ? 'stock-badge--low' : 'stock-badge--ok'}`}>
                            {stock}
                          </span>
                          {min > 0 && <small className="muted"> / min {min}</small>}
                        </td>
                        <td data-label="Actions" className="row-actions">
                          <button
                            type="button"
                            className="icon-button"
                            title="Adjust stock"
                            aria-label={`Adjust stock for ${product.name}`}
                            onClick={() => handleAdjustStock(product)}
                            disabled={adjustingId === product._id}
                          >
                            <SlidersHorizontal size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            title="Edit"
                            aria-label={`Edit ${product.name}`}
                            onClick={() => startEdit(product)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-button icon-button--danger"
                            title="Delete"
                            aria-label={`Delete ${product.name}`}
                            onClick={() => handleDelete(product)}
                            disabled={deletingId === product._id}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}