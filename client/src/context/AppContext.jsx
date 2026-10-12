import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

// Shared state for the whole app:
//   - notifications: success / error messages shown as toasts
//   - dataVersion:   a counter pages watch; refreshData() bumps it so dashboards reload
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [dataVersion, setDataVersion] = useState(0);
  const nextId = useRef(1); // useRef: a counter that must not trigger a re-render

  const dismiss = useCallback((id) => {
    setNotifications((list) => list.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (type, message) => {
      const id = nextId.current++;
      setNotifications((list) => [...list, { id, type, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const refreshData = useCallback(() => setDataVersion((v) => v + 1), []);

  const value = useMemo(
    () => ({ notifications, notify, dismiss, dataVersion, refreshData }),
    [notifications, notify, dismiss, dataVersion, refreshData]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
