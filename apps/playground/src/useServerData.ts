import { useEffect, useRef, useState } from 'react';
import type { TableChange } from '@scope/mantine-datatable-lite';

type Page<T> = { rows: T[]; totalItems: number };

/** Example consumer-owned request lifecycle. A real app can use its own data library instead. */
export function useServerData<T>(
  request: TableChange,
  fetchPage: (request: TableChange, signal: AbortSignal) => Promise<Page<T>>,
) {
  const [result, setResult] = useState<Page<T>>({ rows: [], totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [retryCount, setRetryCount] = useState(0);
  const requestId = useRef(0);
  const requestRef = useRef(request);
  const fetchRef = useRef(fetchPage);
  requestRef.current = request;
  fetchRef.current = fetchPage;
  const signature = JSON.stringify(request);

  useEffect(() => {
    const controller = new AbortController();
    const id = ++requestId.current;
    setLoading(true);
    setError(undefined);
    fetchRef.current(requestRef.current, controller.signal)
      .then((next) => {
        if (id === requestId.current && !controller.signal.aborted) setResult(next);
      })
      .catch((cause: unknown) => {
        if (id !== requestId.current || controller.signal.aborted ||
          (cause instanceof Error && cause.name === 'AbortError')) return;
        setError(cause instanceof Error ? cause.message : 'Could not load data');
      })
      .finally(() => {
        if (id === requestId.current && !controller.signal.aborted) setLoading(false);
      });
    return () => { controller.abort(); requestId.current++; };
  }, [signature, retryCount]);

  return { ...result, loading, error, retry: () => setRetryCount((count) => count + 1) };
}
