import getProductImageUrl from '../utils/productImage';

export default function ProductCard({ item, onAdd }) {
  return (
    <button type="button" className="product-card" onClick={() => onAdd(item)}>
      <img src={getProductImageUrl(item.image)} alt={item.name} />
      <div className="product-card__body">
        <h4>{item.name}</h4>
        <div className="product-card__meta">
          <span>₹{Number(item.sellingPrice || 0)}</span>
          <small>Stock {item.stockOnHand || 0}</small>
        </div>
      </div>
    </button>
  );
}
