import { Link, useParams } from 'react-router-dom';
import { getBook } from '../api/bookApi';
import useFetch from '../hooks/useFetch';
import DataTable from '../components/DataTable.jsx';
import StockBadge from '../components/StockBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function BookDetails() {
  const { id } = useParams();
  const { result, loading, error, reload } = useFetch(() => getBook(id), [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;
  const b = result.data;

  const columns = [
    { key: 'name', header: 'Author', render: (a) => <Link to={`/authors/${a.id}`}>{a.name}</Link> },
    { key: 'email', header: 'Email' },
    {
      key: 'publisher',
      header: 'Publisher',
      render: (a) => (a.publisher ? <Link to={`/publishers/${a.publisher.id}`}>{a.publisher.name}</Link> : '-'),
    },
  ];

  return (
    <section>
      <div className="page-header">
        <h1>{b.title}</h1>
        <div className="row-actions">
          <Link to={`/books/${b.id}/edit`} className="btn">Edit</Link>
          <Link to="/books" className="btn">Back to list</Link>
        </div>
      </div>

      <div className="card">
        <dl className="details">
          <dt>ISBN</dt><dd>{b.isbn}</dd>
          <dt>Genre</dt><dd>{b.genre}</dd>
          <dt>Price</dt><dd>₹{b.price.toFixed(2)}</dd>
          <dt>Current stock</dt>
          <dd>{b.stock} copies <StockBadge stock={b.stock} /> <Link to="/inventory">Manage stock</Link></dd>
        </dl>
      </div>

      <div className="card">
        <h2>Authors and publishers</h2>
        <DataTable columns={columns} rows={b.authors} emptyMessage="No authors linked to this book." />
      </div>
    </section>
  );
}
