import { useId } from 'react';

// A label + input + error message, wired together for accessibility.
// Pass `as="select"` and <option> children for a dropdown.
export default function FormField({ label, name, value, onChange, error, as = 'input', children, ...rest }) {
  const id = useId();
  const Control = as;
  return (
    <div className={error ? 'form-field has-error' : 'form-field'}>
      <label htmlFor={id}>{label}</label>
      <Control
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      >
        {children}
      </Control>
      {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
    </div>
  );
}
