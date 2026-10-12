import { useApp } from '../context/AppContext.jsx';

// Toast messages. They come from AppContext, so any page can call notify().
export default function Notifications() {
  const { notifications, dismiss } = useApp();
  return (
    <div className="toast-area" role="status" aria-live="polite">
      {notifications.map((n) => (
        <div key={n.id} className={`toast toast-${n.type}`}>
          <span>{n.message}</span>
          <button type="button" className="toast-close" onClick={() => dismiss(n.id)} aria-label="Dismiss message">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
