import { useCallback, useEffect, useState } from 'react';

// Runs an API call whenever `deps` change and tracks loading / error state.
//   const { result, loading, error, reload } = useFetch(() => getBooks(params), [params]);
// `result` is the API's JSON body, e.g. { success, data, pagination }.
export default function useFetch(fetcher, deps = []) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false; // ignore the answer if the page changed before it arrived
    setLoading(true);
    setError('');
    fetcher()
      .then((body) => {
        if (!cancelled) setResult(body);
      })
      .catch((err) => {
        if (!cancelled) setError(err.userMessage || err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return { result, loading, error, reload };
}
