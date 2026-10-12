import { useId, useRef } from 'react';

// Controlled search box. useRef lets the "Clear" button put the cursor back in the input.
export default function SearchBar({ value, onChange, placeholder = 'Search...', label = 'Search' }) {
  const inputRef = useRef(null);
  const id = useId();

  const handleClear = () => {
    onChange('');
    inputRef.current.focus();
  };

  return (
    <div className="search-bar">
      <label htmlFor={id} className="sr-only">{label}</label>
      <input
        id={id}
        ref={inputRef}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className="btn btn-ghost" onClick={handleClear}>Clear</button>
      )}
    </div>
  );
}
