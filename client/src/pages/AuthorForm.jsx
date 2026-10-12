import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createAuthor, getAuthor, updateAuthor } from '../api/authorApi';
import { getPublishers } from '../api/publisherApi';
import useFetch from '../hooks/useFetch';
import { useApp } from '../context/AppContext.jsx';
import FormField from '../components/FormField.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthorForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify, refreshData } = useApp();

  const [form, setForm] = useState({ name: '', email: '', publisherId: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const publishers = useFetch(() => getPublishers({ limit: 100 }), []);
  const existing = useFetch(() => (isEdit ? getAuthor(id) : Promise.resolve(null)), [id]);

  useEffect(() => {
    const a = existing.result?.data;
    if (a) setForm({ name: a.name, email: a.email, publisherId: String(a.publisherId) });
  }, [existing.result]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Author name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!EMAIL_PATTERN.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (!form.publisherId) e.publisherId = 'Please choose a publisher';
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
      name: form.name.trim(),
      email: form.email.trim(),
      publisherId: Number(form.publisherId),
    };
    try {
      if (isEdit) await updateAuthor(id, payload);
      else await createAuthor(payload);
      notify('success', isEdit ? 'Author updated' : 'Author created');
      refreshData();
      navigate('/authors');
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setFormError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  if (existing.loading || publishers.loading) return <LoadingSpinner />;
  if (existing.error || publishers.error) return <ErrorMessage message={existing.error || publishers.error} />;

  const publisherList = publishers.result?.data ?? [];

  return (
    <section>
      <div className="page-header">
        <h1>{isEdit ? 'Edit author' : 'Add author'}</h1>
      </div>
      <form className="card form" onSubmit={handleSubmit} noValidate>
        <ErrorMessage message={formError} />
        <FormField label="Name *" name="name" value={form.name} onChange={handleChange} error={errors.name} maxLength={100} />
        <FormField label="Email *" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} maxLength={150} />
        <FormField as="select" label="Publisher *" name="publisherId" value={form.publisherId} onChange={handleChange} error={errors.publisherId}>
          <option value="">Select a publisher</option>
          {publisherList.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </FormField>
        {publisherList.length === 0 && (
          <p className="hint">No publishers yet. <Link to="/publishers/new">Add a publisher first.</Link></p>
        )}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save author'}
          </button>
          <Link to="/authors" className="btn">Cancel</Link>
        </div>
      </form>
    </section>
  );
}
