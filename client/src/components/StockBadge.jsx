import { LOW_STOCK_THRESHOLD } from '../constants.js';

// Shows "Out of stock" (0), "Low stock" (below threshold) or "In stock".
export default function StockBadge({ stock, threshold = LOW_STOCK_THRESHOLD }) {
  if (stock === 0) return <span className="badge badge-danger">Out of stock</span>;
  if (stock < threshold) return <span className="badge badge-warning">Low stock</span>;
  return <span className="badge badge-success">In stock</span>;
}
