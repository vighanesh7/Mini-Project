import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLowStock, searchBooks, updateBookStock } from '../api/bookApi';
import { getDashboardStats } from '../api/dashboardApi';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import { useApp } from '../context/AppContext.jsx';
import { LOW_STOCK_THRESHOLD, PAGE_SIZE } from '../constants.js';
import StatCard from '../components/StatCard.jsx';
import DataTable from '../components/DataTable.jsx';
import Pagination from '../components/Pagination.jsx';
import StockBadge from '../components/StockBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

// One row's "change stock" control. It has its own small state, so typing in one row
// does not re-render the others.
function StockEditor({ book, onSaved }) {
  const { notify, refreshData } = useApp();
  const [value, setValue] = useState(String(book.stock));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!/^\d+$/.test(value.trim())) {
      notify('error', 'Stock must be a whole number (0 or more)');
      return;
    }
    setSaving(true);
    try {
      await updateBookStock(book.id, Number(value));
      notify('success', `Stock for "${book.title}" updated`);
      refreshData();
      onSaved();
    } catch (err) {
      notify('error', err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stock-editor">
      <label className="sr-only" htmlFor={`stock-${book.id}`}>Stock for {book.title}</label>
      <input
        id={`stock-${book.id}`}
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        type="button"
        className="btn btn-small btn-primary"
        onClick={handleSave}
        disabled={saving || value === String(book.stock)}
      >
        {saving ? 'Saving...' : 'Update'}
      </button>
    </div>
  );
}

export default function Inventory() {
  const { dataVersion } = useApp();
  const [view, setView] = useState('all'); // all | low | out
  const [thresholdInput, setThresholdInput] = useState(String(LOW_STOCK_THRESHOLD));
  const [page, setPage] = useState(1);

  // Use the threshold only when it is a valid number (1 or more).
  const debouncedThreshold = useDebounce(thresholdInput);
  const threshold = /^\d+$/.test(debouncedThreshold) && Number(debouncedThreshold) >= 1
    ? Number(debouncedThreshold)
    : LOW_STOCK_THRESHOLD;

  const stats = useFetch(() => getDashboardStats({ threshold }), [threshold, dataVersion]);

  const list = useFetch(() => {
    if (view === 'low') return getLowStock({ threshold, page, limit: PAGE_SIZE });
    if (view === 'out') return searchBooks({ inStock: 'false', sortBy: 'title', page, limit: PAGE_SIZE });
    return searchBooks({ sortBy: 'stock', order: 'ASC', page, limit: PAGE_SIZE });
  }, [view, threshold, page, dataVersion]);

  const s = stats.result?.data;
  const rows = list.result?.data ?? [];

  const changeView = (next) => {
    setView(next);
    setPage(1);
  };

  // /books returns authors as an array; /books/low-stock (raw SQL) returns one text value.
  const authorText = (b) => (Array.isArray(b.authors) ? b.authors.map((a) => a.name).join(', ') : b.authors);

  const columns = [
    { key: 'title', header: 'Title', render: (b) => <Link to={`/books/${b.id}`}>{b.title}</Link> },
    { key: 'isbn', header: 'ISBN' },
    { key: 'authors', header: 'Authors', render: authorText },
    { key: 'stock', header: 'Stock', render: (b) => <>{b.stock} <StockBadge stock={b.stock} threshold={threshold} /></> },
    {
      key: 'update',
      header: 'Change stock',
      render: (b) => <StockEditor key={`${b.id}-${b.stock}`} book={b} onSaved={list.reload} />,
    },
  ];

  return (
    <section>
      <div className="page-header">
        <h1>Inventory</h1>
      </div>

      {stats.loading && <LoadingSpinner label="Loading summary..." />}
      <ErrorMessage message={stats.error} onRetry={stats.reload} />
      {s && (
        <div className="stat-grid">
          <StatCard label="Total copies in stock" value={s.totalCopies} />
          <StatCard label="Out of stock" value={s.outOfStock} tone="danger" />
          <StatCard label={`Low stock (below ${s.lowStockThreshold})`} value={s.lowStock} tone="warning" />
        </div>
      )}

      <div className="toolbar">
        <div className="tab-group" role="group" aria-label="Stock view">
          <button type="button" className={view === 'all' ? 'btn btn-primary' : 'btn'} onClick={() => changeView('all')}>All books</button>
          <button type="button" className={view === 'low' ? 'btn btn-primary' : 'btn'} onClick={() => changeView('low')}>Low-stock report</button>
          <button type="button" className={view === 'out' ? 'btn btn-primary' : 'btn'} onClick={() => changeView('out')}>Out of stock</button>
        </div>
        <div className="form-field threshold-field">
          <label htmlFor="threshold">Low-stock threshold</label>
          <input
            id="threshold"
            type="number"
            min="1"
            value={thresholdInput}
            onChange={(e) => { setThresholdInput(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {view === 'low' && (
        <p className="hint">This report is built with a raw SQL query (joins Books, AuthorBooks and Authors) and lists books with stock below the threshold, including books that are out of stock.</p>
      )}

      {list.loading && <LoadingSpinner />}
      <ErrorMessage message={list.error} onRetry={list.reload} />
      {!list.loading && !list.error && (
        <>
          <DataTable columns={columns} rows={rows} emptyMessage="Nothing to show here." />
          <Pagination pagination={list.result?.pagination} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}
