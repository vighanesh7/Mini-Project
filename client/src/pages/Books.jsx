import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteBook, getGenres, searchBooks } from '../api/bookApi';
import { getAuthors } from '../api/authorApi';
import { getPublishers } from '../api/publisherApi';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import { useApp } from '../context/AppContext.jsx';
import { PAGE_SIZE } from '../constants.js';
import SearchBar from '../components/SearchBar.jsx';
import FilterPanel from '../components/FilterPanel.jsx';
import DataTable from '../components/DataTable.jsx';
import Pagination from '../components/Pagination.jsx';
import StockBadge from '../components/StockBadge.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const EMPTY_FILTERS = { genre: '', authorId: '', publisherId: '', inStock: '', sortBy: 'title', order: 'ASC' };

export default function Books() {
  const { notify, refreshData, dataVersion } = useApp();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  // Dropdown data for the filter panel
  const genres = useFetch(() => getGenres(), [dataVersion]);
  const authors = useFetch(() => getAuthors({ limit: 100 }), []);
  const publishers = useFetch(() => getPublishers({ limit: 100 }), []);

  // The book list: calls GET /api/books/search with every filter the user chose.
  const { result, loading, error, reload } = useFetch(
    () =>
      searchBooks({
        q: debouncedSearch || undefined,
        genre: filters.genre || undefined,
        authorId: filters.authorId || undefined,
        publisherId: filters.publisherId || undefined,
        inStock: filters.inStock || undefined,
        sortBy: filters.sortBy,
        order: filters.order,
        page,
        limit: PAGE_SIZE,
      }),
    [debouncedSearch, filters, page]
  );
  const rows = result?.data ?? [];

  // useCallback: these functions are passed to child components, so we keep them stable.
  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);
  const handleFilterChange = useCallback((name, value) => {
    setFilters((f) => ({ ...f, [name]: value }));
    setPage(1);
  }, []);
  const clearAll = () => {
    setSearch('');
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBook(toDelete.id);
      notify('success', `Book "${toDelete.title}" deleted`);
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
    { key: 'title', header: 'Title', render: (b) => <Link to={`/books/${b.id}`}>{b.title}</Link> },
    { key: 'isbn', header: 'ISBN' },
    { key: 'genre', header: 'Genre' },
    { key: 'authors', header: 'Authors', render: (b) => b.authors.map((a) => a.name).join(', ') },
    { key: 'price', header: 'Price', render: (b) => `₹${b.price.toFixed(2)}` },
    { key: 'stock', header: 'Stock', render: (b) => <>{b.stock} <StockBadge stock={b.stock} /></> },
    {
      key: 'actions',
      header: 'Actions',
      render: (b) => (
        <div className="row-actions">
          <Link to={`/books/${b.id}`} className="btn btn-small">View</Link>
          <Link to={`/books/${b.id}/edit`} className="btn btn-small">Edit</Link>
          <button type="button" className="btn btn-small btn-danger" onClick={() => setToDelete(b)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <section>
      <div className="page-header">
        <h1>Books</h1>
        <Link to="/books/new" className="btn btn-primary">+ Add book</Link>
      </div>

      <SearchBar value={search} onChange={handleSearch} placeholder="Search by title, ISBN or genre" label="Search books" />
      <FilterPanel
        filters={filters}
        onChange={handleFilterChange}
        genres={genres.result?.data ?? []}
        authors={authors.result?.data ?? []}
        publishers={publishers.result?.data ?? []}
      />
      <button type="button" className="btn btn-ghost" onClick={clearAll}>Reset search and filters</button>

      {loading && <LoadingSpinner />}
      <ErrorMessage message={error} onRetry={reload} />
      {!loading && !error && (
        <>
          <DataTable columns={columns} rows={rows} emptyMessage="No books match your search." />
          <Pagination pagination={result?.pagination} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete book?"
        message={toDelete ? `Delete "${toDelete.title}"? This cannot be undone.` : ''}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
