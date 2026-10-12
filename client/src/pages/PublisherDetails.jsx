import { Link, useParams } from 'react-router-dom';
import { getPublisher, getPublisherAuthors } from '../api/publisherApi';
import useFetch from '../hooks/useFetch';
import DataTable from '../components/DataTable.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function PublisherDetails() {
  const { id } = useParams();
  const publisher = useFetch(() => getPublisher(id), [id]);
  const authors = useFetch(() => getPublisherAuthors(id, { limit: 100 }), [id]);

  if (publisher.loading) return <LoadingSpinner />;
  if (publisher.error) return <ErrorMessage message={publisher.error} onRetry={publisher.reload} />;
  const p = publisher.result.data;

  const columns = [
    { key: 'name', header: 'Name', render: (a) => <Link to={`/authors/${a.id}`}>{a.name}</Link> },
    { key: 'email', header: 'Email' },
  ];

  return (
    <section>
      <div className="page-header">
        <h1>{p.name}</h1>
        <div className="row-actions">
          <Link to={`/publishers/${p.id}/edit`} className="btn">Edit</Link>
          <Link to="/publishers" className="btn">Back to list</Link>
        </div>
      </div>

      <div className="card">
        <dl className="details">
          <dt>Country</dt><dd>{p.country}</dd>
          <dt>Created</dt><dd>{new Date(p.createdAt).toLocaleString()}</dd>
          <dt>Last updated</dt><dd>{new Date(p.updatedAt).toLocaleString()}</dd>
        </dl>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Authors</h2>
          <Link to="/authors/new" className="btn btn-small">+ Add author</Link>
        </div>
        {authors.loading && <LoadingSpinner />}
        <ErrorMessage message={authors.error} onRetry={authors.reload} />
        {!authors.loading && !authors.error && (
          <DataTable columns={columns} rows={authors.result?.data ?? []} emptyMessage="This publisher has no authors yet." />
        )}
      </div>
    </section>
  );
}
