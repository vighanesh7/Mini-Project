import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuthors, deleteAuthor } from '../api/authorApi';
import { getPublishers } from '../api/publisherApi';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import { useApp } from '../context/AppContext.jsx';
import { PAGE_SIZE } from '../constants.js';
import SearchBar from '../components/SearchBar.jsx';
import FormField from '../components/FormField.jsx';
import DataTable from '../components/DataTable.jsx';
import Pagination from '../components/Pagination.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function Authors() {
  const { notify, refreshData } = useApp();
  const [search, setSearch] = useState('');
  const [publisherId, setPublisherId] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);
  const publishers = useFetch(() => getPublishers({ limit: 100 }), []);
  const { result, loading, error, reload } = useFetch(
    () =>
      getAuthors({
        q: debouncedSearch || undefined,
        publisherId: publisherId || undefined,
        page,
        limit: PAGE_SIZE,
      }),
    [debouncedSearch, publisherId, page]
  );
  const rows = result?.data ?? [];

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAuthor(toDelete.id);
      notify('success', `Author "${toDelete.name}" deleted`);
      refreshData();
      if (rows.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      notify('error', err.userMessage);
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (a) => <Link to={`/authors/${a.id}`}>{a.name}</Link> },
    { key: 'email', header: 'Email' },
    { key: 'publisher', header: 'Publisher', render: (a) => a.publisher?.name ?? '-' },
    {
      key: 'actions',
      header: 'Actions',
      render: (a) => (
        <div className="row-actions">
          <Link to={`/authors/${a.id}`} className="btn btn-small">View</Link>
          <Link to={`/authors/${a.id}/edit`} className="btn btn-small">Edit</Link>
          <button type="button" className="btn btn-small btn-danger" onClick={() => setToDelete(a)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <section>
      <div className="page-header">
        <h1>Authors</h1>
        <Link to="/authors/new" className="btn btn-primary">+ Add author</Link>
      </div>

      <div className="toolbar">
        <SearchBar
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search by name or email"
          label="Search authors"
        />
        <FormField
          as="select"
          label="Publisher"
          name="publisherId"
          value={publisherId}
          onChange={(e) => { setPublisherId(e.target.value); setPage(1); }}
        >
          <option value="">All publishers</option>
          {(publishers.result?.data ?? []).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </FormField>
      </div>

      {loading && <LoadingSpinner />}
      <ErrorMessage message={error} onRetry={reload} />
      {!loading && !error && (
        <>
          <DataTable columns={columns} rows={rows} emptyMessage="No authors found." />
          <Pagination pagination={result?.pagination} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete author?"
        message={toDelete ? `Delete "${toDelete.name}"? Their links to books will be removed too.` : ''}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
