import { Link } from 'react-router-dom';

// Props: label (text), value (number/text), tone (optional colour), to (optional link)
export default function StatCard({ label, value, tone = 'default', to }) {
  const content = (
    <>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </>
  );
  return to ? (
    <Link to={to} className={`stat-card stat-${tone}`}>{content}</Link>
  ) : (
    <div className={`stat-card stat-${tone}`}>{content}</div>
  );
}
