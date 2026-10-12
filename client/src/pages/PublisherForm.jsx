import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createPublisher, getPublisher, updatePublisher } from '../api/publisherApi';
import useFetch from '../hooks/useFetch';
import { useApp } from '../context/AppContext.jsx';
import FormField from '../components/FormField.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function PublisherForm() {
  const { id } = useParams(); // present on /publishers/:id/edit, missing on /publishers/new
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify, refreshData } = useApp();

  const [form, setForm] = useState({ name: '', country: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // In edit mode load the existing record; in create mode there is nothing to load.
  const { result, loading, error } = useFetch(
    () => (isEdit ? getPublisher(id) : Promise.resolve(null)),
    [id]
  );

  useEffect(() => {
    if (result?.data) setForm({ name: result.data.name, country: result.data.country });
  }, [result]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Publisher name is required';
    else if (form.name.trim().length > 100) e.name = 'Name must be at most 100 characters';
    if (!form.country.trim()) e.country = 'Country is required';
    else if (form.country.trim().length > 60) e.country = 'Country must be at most 60 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return; // block double submits
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setFormError('');
    const payload = { name: form.name.trim(), country: form.country.trim() };
    try {
      if (isEdit) await updatePublisher(id, payload);
      else await createPublisher(payload);
      notify('success', isEdit ? 'Publisher updated' : 'Publisher created');
      refreshData();
      navigate('/publishers');
    } catch (err) {
      setErrors(err.fieldErrors || {}); // form values are kept so the user can fix them
      setFormError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <section>
      <div className="page-header">
        <h1>{isEdit ? 'Edit publisher' : 'Add publisher'}</h1>
      </div>
      <form className="card form" onSubmit={handleSubmit} noValidate>
        <ErrorMessage message={formError} />
        <FormField label="Name *" name="name" value={form.name} onChange={handleChange} error={errors.name} maxLength={100} />
        <FormField label="Country *" name="country" value={form.country} onChange={handleChange} error={errors.country} maxLength={60} />
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save publisher'}
          </button>
          <Link to="/publishers" className="btn">Cancel</Link>
        </div>
      </form>
    </section>
  );
}
