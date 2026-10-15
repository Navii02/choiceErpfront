import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import getProductImageUrl from '../utils/productImage';

const sampleCategories = ['All', 'Cakes', 'Pastries', 'Breads', 'Snacks'];

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bill, setBill] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      const { data } = await api.get('/products');
      setProducts(data.data || []);
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;
    return products.filter((product) => product.category?.name === selectedCategory);
  }, [products, selectedCategory]);

  const addToBill = (product) => {
    setBill((current) => {
      const existing = current.find((item) => item._id === product._id);
      if (existing) {
        return current.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, qty) => {
    setBill((current) =>
      current
        .map((item) => (item._id === id ? { ...item, quantity: Math.max(1, qty) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const total = bill.reduce((sum, item) => sum + Number(item.sellingPrice || 0) * Number(item.quantity || 0), 0);

  const settleSale = async () => {
    if (!bill.length) return;
    const payload = {
      items: bill.map((item) => ({ productId: item._id, quantity: item.quantity })),
      paymentMethod: 'cash',
    };

    await api.post('/sales/pos', payload);
    setBill([]);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">POS / Billing</p>
          <h1>Fast checkout</h1>
        </div>
      </div>

      <div className="pos-layout">
        <div className="panel pos-panel">
          <div className="toolbar-row">
            <input className="search-box" placeholder="Search product" />
            <div className="pill-group">
              {sampleCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`pill ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <button key={product._id} type="button" className="product-card pos-product" onClick={() => addToBill(product)}>
                <img src={getProductImageUrl(product.image)} alt={product.name} />
                <div>
                  <h4>{product.name}</h4>
                  <small>₹{product.sellingPrice}</small>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="panel bill-panel">
          <h3>Current bill</h3>
          {bill.length === 0 ? (
            <p className="muted">No items added yet.</p>
          ) : (
            <div className="bill-list">
              {bill.map((item) => (
                <div key={item._id} className="bill-item">
                  <div>
                    <strong>{item.name}</strong>
                    <span>₹{item.sellingPrice}</span>
                  </div>
                  <div className="bill-controls">
                    <input
                      type="number"
                      value={item.quantity}
                      min={1}
                      onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
                    />
                    <button type="button" onClick={() => updateQuantity(item._id, 0)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bill-summary">
            <div><span>Subtotal</span><strong>₹{total}</strong></div>
            <div><span>Tax</span><strong>₹0</strong></div>
            <div className="grand-total"><span>Total</span><strong>₹{total}</strong></div>
          </div>

          <button className="primary-button wide-button" onClick={settleSale}>Generate invoice</button>
        </div>
      </div>
    </div>
  );
}
