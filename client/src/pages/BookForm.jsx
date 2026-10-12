import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createBook, getBook, getGenres, updateBook } from '../api/bookApi';
import { getAuthors } from '../api/authorApi';
import useFetch from '../hooks/useFetch';
import { useApp } from '../context/AppContext.jsx';
import FormField from '../components/FormField.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const EMPTY = { title: '', isbn: '', genre: '', price: '', stock: '0', authorIds: [] };

export default function BookForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify, refreshData } = useApp();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [authorFilter, setAuthorFilter] = useState('');

  const authors = useFetch(() => getAuthors({ limit: 100 }), []);
  const genres = useFetch(() => getGenres(), []);
  const existing = useFetch(() => (isEdit ? getBook(id) : Promise.resolve(null)), [id]);

  useEffect(() => {
    const b = existing.result?.data;
    if (b) {
      setForm({
        title: b.title,
        isbn: b.isbn,
        genre: b.genre,
        price: String(b.price),
        stock: String(b.stock),
        authorIds: b.authors.map((a) => a.id),
      });
    }
  }, [existing.result]);

  // useMemo: only re-filter the author list when the list or the search text changes.
  const visibleAuthors = useMemo(() => {
    const list = authors.result?.data ?? [];
    const text = authorFilter.trim().toLowerCase();
    return text ? list.filter((a) => a.name.toLowerCase().includes(text)) : list;
  }, [authors.result, authorFilter]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toggleAuthor = (authorId) => {
    setForm((f) => ({
      ...f,
      authorIds: f.authorIds.includes(authorId)
        ? f.authorIds.filter((x) => x !== authorId)
        : [...f.authorIds, authorId],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.isbn.trim()) e.isbn = 'ISBN is required';
    else if (!/^[0-9Xx-]{10,17}$/.test(form.isbn.trim())) e.isbn = 'ISBN must be 10-17 characters: digits, X or hyphens';
    if (!form.genre.trim()) e.genre = 'Genre is required';
    if (!/^\d{1,8}(\.\d{1,2})?$/.test(form.price.trim())) e.price = 'Price must be a number like 499 or 499.50';
    if (!/^\d+$/.test(form.stock.trim())) e.stock = 'Stock must be a whole number (0 or more)';
    if (form.authorIds.length === 0) e.authorIds = 'Select at least one author';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setFormError('');
    const payload = {
      title: form.title.trim(),
      isbn: form.isbn.trim(),
      genre: form.genre.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      authorIds: form.authorIds,
    };
    try {
      if (isEdit) await updateBook(id, payload);
      else await createBook(payload);
      notify('success', isEdit ? 'Book updated' : 'Book created');
      refreshData();
      navigate('/books');
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setFormError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  if (existing.loading || authors.loading) return <LoadingSpinner />;
  if (existing.error || authors.error) return <ErrorMessage message={existing.error || authors.error} />;

  const allAuthors = authors.result?.data ?? [];

  return (
    <section>
      <div className="page-header">
        <h1>{isEdit ? 'Edit book' : 'Add book'}</h1>
      </div>
      <form className="card form" onSubmit={handleSubmit} noValidate>
        <ErrorMessage message={formError} />
        <FormField label="Title *" name="title" value={form.title} onChange={handleChange} error={errors.title} maxLength={200} />
        <FormField label="ISBN *" name="isbn" value={form.isbn} onChange={handleChange} error={errors.isbn} maxLength={17} />
        <FormField label="Genre *" name="genre" value={form.genre} onChange={handleChange} error={errors.genre} maxLength={60} list="genre-options" />
        <datalist id="genre-options">
          {(genres.result?.data ?? []).map((g) => <option key={g} value={g} />)}
        </datalist>
        <div className="form-row">
          <FormField label="Price (₹) *" name="price" inputMode="decimal" value={form.price} onChange={handleChange} error={errors.price} />
          <FormField label="Stock *" name="stock" inputMode="numeric" value={form.stock} onChange={handleChange} error={errors.stock} />
        </div>

        <fieldset className={errors.authorIds ? 'author-picker has-error' : 'author-picker'}>
          <legend>Authors * ({form.authorIds.length} selected)</legend>
          {allAuthors.length === 0 ? (
            <p className="hint">No authors yet. <Link to="/authors/new">Add an author first.</Link></p>
          ) : (
            <>
              <input
                type="search"
                aria-label="Filter authors by name"
                placeholder="Filter authors..."
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
              />
              <div className="checkbox-list">
                {visibleAuthors.map((a) => (
                  <label key={a.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={form.authorIds.includes(a.id)}
                      onChange={() => toggleAuthor(a.id)}
                    />
                    {a.name} <small>({a.publisher?.name})</small>
                  </label>
                ))}
                {visibleAuthors.length === 0 && <p className="hint">No authors match.</p>}
              </div>
            </>
          )}
          {errors.authorIds && <p className="field-error">{errors.authorIds}</p>}
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save book'}
          </button>
          <Link to="/books" className="btn">Cancel</Link>
        </div>
      </form>
    </section>
  );
}
