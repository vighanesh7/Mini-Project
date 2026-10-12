import { Link } from 'react-router-dom';
import { getDashboardStats, getRecentBooks } from '../api/dashboardApi';
import useFetch from '../hooks/useFetch';
import { useApp } from '../context/AppContext.jsx';
import StatCard from '../components/StatCard.jsx';
import DataTable from '../components/DataTable.jsx';
import StockBadge from '../components/StockBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function Dashboard() {
  const { dataVersion } = useApp(); // changes after any create/update/delete, so we reload
  const stats = useFetch(() => getDashboardStats(), [dataVersion]);
  const recent = useFetch(() => getRecentBooks({ limit: 5 }), [dataVersion]);

  const s = stats.result?.data;
  const recentBooks = recent.result?.data ?? [];

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (b) => <Link to={`/books/${b.id}`}>{b.title}</Link>,
    },
    { key: 'authors', header: 'Authors', render: (b) => b.authors.map((a) => a.name).join(', ') },
    { key: 'stock', header: 'Stock', render: (b) => <>{b.stock} <StockBadge stock={b.stock} /></> },
  ];

  return (
    <section>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {stats.loading && <LoadingSpinner label="Loading statistics..." />}
      <ErrorMessage message={stats.error} onRetry={stats.reload} />

      {s && (
        <div className="stat-grid">
          <StatCard label="Publishers" value={s.totalPublishers} to="/publishers" />
          <StatCard label="Authors" value={s.totalAuthors} to="/authors" />
          <StatCard label="Books" value={s.totalBooks} to="/books" />
          <StatCard label="Copies in stock" value={s.totalCopies} to="/inventory" />
          <StatCard label="Out of stock" value={s.outOfStock} tone="danger" to="/inventory" />
          <StatCard label={`Low stock (below ${s.lowStockThreshold})`} value={s.lowStock} tone="warning" to="/inventory" />
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Recently added books</h2>
          <Link to="/books" className="btn btn-small">All books</Link>
        </div>
        {recent.loading && <LoadingSpinner />}
        <ErrorMessage message={recent.error} onRetry={recent.reload} />
        {!recent.loading && !recent.error && (
          <DataTable columns={columns} rows={recentBooks} emptyMessage="No books yet. Add your first book." />
        )}
      </div>

      <div className="quick-links">
        <Link to="/publishers/new" className="btn">+ Add publisher</Link>
        <Link to="/authors/new" className="btn">+ Add author</Link>
        <Link to="/books/new" className="btn btn-primary">+ Add book</Link>
      </div>
    </section>
  );
}
