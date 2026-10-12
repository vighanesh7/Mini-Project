import FormField from './FormField.jsx';

// Filter + sort controls for the Books page.
// Props: filters (object), onChange(name, value), genres, authors, publishers
export default function FilterPanel({ filters, onChange, genres, authors, publishers }) {
  const handle = (e) => onChange(e.target.name, e.target.value);
  return (
    <div className="filter-panel">
      <FormField as="select" label="Genre" name="genre" value={filters.genre} onChange={handle}>
        <option value="">All genres</option>
        {genres.map((g) => <option key={g} value={g}>{g}</option>)}
      </FormField>
      <FormField as="select" label="Author" name="authorId" value={filters.authorId} onChange={handle}>
        <option value="">All authors</option>
        {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </FormField>
      <FormField as="select" label="Publisher" name="publisherId" value={filters.publisherId} onChange={handle}>
        <option value="">All publishers</option>
        {publishers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </FormField>
      <FormField as="select" label="Availability" name="inStock" value={filters.inStock} onChange={handle}>
        <option value="">Any</option>
        <option value="true">In stock</option>
        <option value="false">Out of stock</option>
      </FormField>
      <FormField as="select" label="Sort by" name="sortBy" value={filters.sortBy} onChange={handle}>
        <option value="title">Title</option>
        <option value="price">Price</option>
        <option value="stock">Stock</option>
      </FormField>
      <FormField as="select" label="Order" name="order" value={filters.order} onChange={handle}>
        <option value="ASC">Ascending</option>
        <option value="DESC">Descending</option>
      </FormField>
    </div>
  );
}
