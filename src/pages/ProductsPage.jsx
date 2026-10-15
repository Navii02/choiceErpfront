import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    unit: '',
    sellingPrice: 0,
    costPrice: 0,
    productType: 'finished_product',
    status: 'active',
    image: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, unitsRes, productsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/units'),
        api.get('/products'),
      ]);

      setCategories(categoriesRes.data.data || []);
      setUnits(unitsRes.data.data || []);
      setProducts(productsRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', form);
      setForm({
        name: '',
        sku: '',
        category: '',
        unit: '',
        sellingPrice: 0,
        costPrice: 0,
        productType: 'finished_product',
        status: 'active',
        image: '',
        description: '',
      });
      loadData();
    } catch (error) {
      console.error('Product create failed', error);
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
          <h3>Add product</h3>

          <div className="form-grid">
            <label>
              Product name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              SKU
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              Unit
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="">Select unit</option>
                {units.map((unit) => (
                  <option key={unit._id} value={unit._id}>{unit.name}</option>
                ))}
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
              <input
                type="url"
                value={form.image}
                placeholder="https://example.com/product-image.jpg"
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
              <small>Use a public, direct image URL. The image is displayed from its source and is not uploaded.</small>
            </label>
            <label className="span-two">
              Description
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
          </div>

          <button type="submit" className="primary-button">Save product</button>
        </form>

        <div className="panel">
          <h3>Product list</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>₹{product.sellingPrice}</td>
                      <td>{product.stockOnHand || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
