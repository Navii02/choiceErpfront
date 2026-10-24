import { useEffect, useMemo, useState } from 'react';
import { getDb } from '../db/localDb';
import { enqueueInvoice, countByStatus } from '../db/invoiceRepo';
import { syncAll, onSyncUpdate } from '../sync/syncEngine';
import api from '../services/api';
import getProductImageUrl from '../utils/productImage';
import './POSPage.css';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi',  label: 'UPI'  },
];

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [bill, setBill] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [syncState, setSyncState] = useState({ phase: 'idle' });
  const [toast, setToast] = useState('');
  const [checkoutLock, setCheckoutLock] = useState(false);
  const [billOpen, setBillOpen] = useState(false); // mobile expand toggle

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get('/products');
        const list = data.data || [];
        const db = await getDb();
        const tx = db.transaction('products', 'readwrite');
        await Promise.all(list.map((p) => tx.store.put(p)));
        await tx.done;
        if (!cancelled) setProducts(list);
      } catch {
        const db = await getDb();
        const cached = await db.getAll('products');
        if (!cancelled) setProducts(cached);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => onSyncUpdate(setSyncState), []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category?.name).filter(Boolean));
    return ['All', ...set];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const inCategory = selectedCategory === 'All' || p.category?.name === selectedCategory;
      const matches = !term
        || p.name?.toLowerCase().includes(term)
        || p.sku?.toLowerCase().includes(term);
      return inCategory && matches;
    });
  }, [products, selectedCategory, search]);

  const addToBill = (product) => {
    setBill((cur) => {
      const existing = cur.find((i) => i._id === product._id);
      if (existing) {
        return cur.map((i) =>
          i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...cur, { ...product, quantity: 1 }];
    });
    setBillOpen(true); // open bill on mobile after adding
  };

  const incrementItem = (id) => {
    setBill((cur) =>
      cur.map((i) => (i._id === id ? { ...i, quantity: i.quantity + 1 } : i))
    );
  };

  const decrementItem = (id) => {
    setBill((cur) =>
      cur
        .map((i) => (i._id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const setQuantity = (id, qty) => {
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) return;
    setBill((cur) => cur.map((i) => (i._id === id ? { ...i, quantity: n } : i)));
  };

  const removeItem = (id) => setBill((cur) => cur.filter((i) => i._id !== id));
  const clearBill = () => setBill([]);

  const totals = useMemo(() => {
    const subtotal = bill.reduce(
      (sum, i) => sum + Number(i.sellingPrice || 0) * Number(i.quantity || 0),
      0
    );
    const tax = 0;
    const grandTotal = Math.round(subtotal + tax);
    return { subtotal, tax, grandTotal };
  }, [bill]);

  const itemCount = useMemo(
    () => bill.reduce((n, i) => n + Number(i.quantity || 0), 0),
    [bill]
  );

  const settleSale = async () => {
    if (!bill.length || checkoutLock) return;

    setCheckoutLock(true);
    try {
      const invoice = await enqueueInvoice({
        items: bill.map((i) => ({
          productId: i._id,
          name: i.name,
          qty: i.quantity,
          price: i.sellingPrice,
        })),
        paymentMethod,
        totals,
      });

      setBill([]);
      setBillOpen(false);
      setToast(`Saved locally · Invoice ${invoice.clientInvoiceId.slice(0, 8)}`);
      syncAll().catch(() => {});

      setTimeout(async () => {
        const counts = await countByStatus();
        setToast(`Queue: ${counts.pending || 0} pending · ${counts.synced || 0} synced`);
      }, 800);
    } catch {
      alert('Could not save the invoice locally. Do not close this tab.');
    } finally {
      setCheckoutLock(false);
    }
  };

  const queueCount = syncState.counts?.pending || 0;

  return (
    <div className="pos-page">
      <div className="page-header pos-header">
        <div>
          <p className="eyebrow">POS / Billing</p>
          <h1>Fast checkout</h1>
        </div>
        <div className="topbar-actions">
          <span className={`chip ${queueCount ? '' : 'chip--ok'}`}>
            {queueCount ? `${queueCount} pending` : 'All synced'}
          </span>
          <button type="button" className="pill" onClick={() => syncAll()}>
            Sync now
          </button>
        </div>
      </div>

      {toast && <div className="pos-toast">{toast}</div>}

      <div className="pos-layout">
        <section className="panel pos-panel">
          <div className="toolbar-row">
            <div className="pos-search">
              <input
                type="search"
                className="search-box"
                placeholder="Search by name or SKU…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search products"
              />
            </div>

            <div className="pill-group">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`pill ${selectedCategory === c ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <p className="muted pos-empty">No products match your search.</p>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => {
                const inBill = bill.find((i) => i._id === product._id)?.quantity || 0;
                const soldOut = (product.stockOnHand ?? 0) <= 0;
                return (
                  <button
                    key={product._id}
                    type="button"
                    className={`product-card pos-product ${soldOut ? 'is-sold-out' : ''}`}
                    onClick={() => !soldOut && addToBill(product)}
                    disabled={soldOut}
                    title={soldOut ? 'Out of stock' : product.name}
                  >
                    <div className="pos-product-img">
                      <img src={getProductImageUrl(product.image)} alt={product.name} />
                      {inBill > 0 && (
                        <span className="pos-product-badge">{inBill}</span>
                      )}
                    </div>
                    <div className="pos-product-body">
                      <h4>{product.name}</h4>
                      <div className="pos-product-meta">
                        <span className="price">₹{Number(product.sellingPrice || 0)}</span>
                        <small className={soldOut ? 'danger' : ''}>
                          {soldOut ? 'Out of stock' : `Stock ${product.stockOnHand ?? 0}`}
                        </small>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <aside className={`panel bill-panel ${billOpen ? '' : 'is-collapsed'}`}>
          <button
            type="button"
            className="bill-toggle"
            onClick={() => setBillOpen((v) => !v)}
            aria-expanded={billOpen}
          >
            <span>
              {bill.length === 0
                ? 'Bill empty'
                : `${itemCount} item${itemCount === 1 ? '' : 's'} · ₹${totals.grandTotal}`}
            </span>
            <span className="bill-toggle-cta">
              {billOpen ? 'Hide' : bill.length ? 'View bill' : 'Add items'}
            </span>
          </button>

          <div className="bill-header">
            <h3>Current bill</h3>
            {bill.length > 0 && (
              <button type="button" className="link-button" onClick={clearBill}>
                Clear
              </button>
            )}
          </div>

          {bill.length === 0 ? (
            <p className="muted bill-empty">No items added yet. Tap a product to begin.</p>
          ) : (
            <div className="bill-list">
              {bill.map((item) => (
                <div key={item._id} className="bill-item">
                  <div className="bill-item-info">
                    <strong>{item.name}</strong>
                    <span className="muted">₹{Number(item.sellingPrice || 0)} each</span>
                  </div>

                  <div className="bill-controls">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => decrementItem(item._id)}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >−</button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => setQuantity(item._id, e.target.value)}
                      aria-label={`Quantity of ${item.name}`}
                    />
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => incrementItem(item._id)}
                      aria-label={`Increase quantity of ${item.name}`}
                    >+</button>
                  </div>

                  <div className="bill-line-total">
                    ₹{Number(item.sellingPrice || 0) * Number(item.quantity || 0)}
                  </div>

                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeItem(item._id)}
                    aria-label={`Remove ${item.name}`}
                  >×</button>
                </div>
              ))}
            </div>
          )}

          <div className="payment-row">
            <span className="payment-label">Payment</span>
            <div className="pill-group">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={`pill ${paymentMethod === m.value ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bill-summary">
            <div><span>Items</span><strong>{itemCount}</strong></div>
            <div><span>Subtotal</span><strong>₹{totals.subtotal}</strong></div>
            <div><span>Tax</span><strong>₹{totals.tax}</strong></div>
            <div className="grand-total">
              <span>Total</span><strong>₹{totals.grandTotal}</strong>
            </div>
          </div>

          <button
            className="primary-button wide-button"
            onClick={settleSale}
            disabled={!bill.length || checkoutLock}
          >
            {checkoutLock ? 'Saving…' : `Save · ₹${totals.grandTotal}`}
          </button>
        </aside>
      </div>
    </div>
  );
}