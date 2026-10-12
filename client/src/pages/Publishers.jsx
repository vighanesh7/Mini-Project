import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublishers, deletePublisher } from '../api/publisherApi';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import { useApp } from '../context/AppContext.jsx';
import { PAGE_SIZE } from '../constants.js';
import SearchBar from '../components/SearchBar.jsx';
import DataTable from '../components/DataTable.jsx';
import Pagination from '../components/Pagination.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function Publishers() {
  const { notify, refreshData } = useApp();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);
  const { result, loading, error, reload } = useFetch(
    () => getPublishers({ q: debouncedSearch || undefined, page, limit: PAGE_SIZE }),
    [debouncedSearch, page]
  );
  const rows = result?.data ?? [];

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePublisher(toDelete.id);
      notify('success', `Publisher "${toDelete.name}" deleted`);
      refreshData();
      if (rows.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      notify('error', err.userMessage); // e.g. "still has authors" (409)
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (p) => <Link to={`/publishers/${p.id}`}>{p.name}</Link> },
    { key: 'country', header: 'Country' },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div className="row-actions">
          <Link to={`/publishers/${p.id}`} className="btn btn-small">View</Link>
          <Link to={`/publishers/${p.id}/edit`} className="btn btn-small">Edit</Link>
          <button type="button" className="btn btn-small btn-danger" onClick={() => setToDelete(p)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <section>
      <div className="page-header">
        <h1>Publishers</h1>
        <Link to="/publishers/new" className="btn btn-primary">+ Add publisher</Link>
      </div>

      <SearchBar value={search} onChange={handleSearch} placeholder="Search by name or country" label="Search publishers" />

      {loading && <LoadingSpinner />}
      <ErrorMessage message={error} onRetry={reload} />
      {!loading && !error && (
        <>
          <DataTable columns={columns} rows={rows} emptyMessage="No publishers found." />
          <Pagination pagination={result?.pagination} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete publisher?"
        message={toDelete ? `Delete "${toDelete.name}"? This cannot be undone.` : ''}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
