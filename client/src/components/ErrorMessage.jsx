// Props: message (text), onRetry (optional function -> shows a Retry button)
export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="alert alert-error" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn-small" onClick={onRetry}>Retry</button>
      )}
    </div>
  );
}
