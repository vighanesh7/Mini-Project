export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="spinner-wrap" role="status">
      <div className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
