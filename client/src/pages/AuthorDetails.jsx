import { Link, useParams } from 'react-router-dom';
import { getAuthor, getAuthorBooks } from '../api/authorApi';
import useFetch from '../hooks/useFetch';
import DataTable from '../components/DataTable.jsx';
import StockBadge from '../components/StockBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function AuthorDetails() {
  const { id } = useParams();
  const author = useFetch(() => getAuthor(id), [id]);
  const books = useFetch(() => getAuthorBooks(id, { limit: 100 }), [id]);

  if (author.loading) return <LoadingSpinner />;
  if (author.error) return <ErrorMessage message={author.error} onRetry={author.reload} />;
  const a = author.result.data;

  const columns = [
    { key: 'title', header: 'Title', render: (b) => <Link to={`/books/${b.id}`}>{b.title}</Link> },
    { key: 'isbn', header: 'ISBN' },
    { key: 'genre', header: 'Genre' },
    { key: 'price', header: 'Price', render: (b) => `₹${b.price.toFixed(2)}` },
    { key: 'stock', header: 'Stock', render: (b) => <>{b.stock} <StockBadge stock={b.stock} /></> },
  ];

  return (
    <section>
      <div className="page-header">
        <h1>{a.name}</h1>
        <div className="row-actions">
          <Link to={`/authors/${a.id}/edit`} className="btn">Edit</Link>
          <Link to="/authors" className="btn">Back to list</Link>
        </div>
      </div>

      <div className="card">
        <dl className="details">
          <dt>Email</dt><dd>{a.email}</dd>
          <dt>Publisher</dt>
          <dd>{a.publisher ? <Link to={`/publishers/${a.publisher.id}`}>{a.publisher.name}</Link> : '-'}</dd>
        </dl>
      </div>

      <div className="card">
        <h2>Books by {a.name}</h2>
        {books.loading && <LoadingSpinner />}
        <ErrorMessage message={books.error} onRetry={books.reload} />
        {!books.loading && !books.error && (
          <DataTable columns={columns} rows={books.result?.data ?? []} emptyMessage="This author has no books yet." />
        )}
      </div>
    </section>
  );
}
