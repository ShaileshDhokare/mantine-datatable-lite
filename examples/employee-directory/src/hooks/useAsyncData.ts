import { useCallback, useEffect, useState, type DependencyList } from 'react';
import { errorMessage, isCancel } from '../api/http';

export type AsyncData<T> = {
  /** The last successful result. It stays while the next load runs. */
  data: T | undefined;
  /** True while a load runs, and before the first one. */
  loading: boolean;
  /** The last load's error message. */
  error: string | undefined;
  /** Runs the load again, e.g. after an error or a change on the server. */
  reload: () => void;
};

/**
 * Loads data on mount and whenever `deps` change; pass `null` to skip loading.
 * `deps` lists everything `load` reads, like the dependencies of `useEffect`.
 * A newer load, or unmounting, aborts the previous request, so a late response
 * never replaces a newer one.
 */
export function useAsyncData<T>(
  load: ((signal: AbortSignal) => Promise<T>) | null,
  deps: DependencyList,
): AsyncData<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!load) return;
    const controller = new AbortController();
    setLoading(true);
    setError(undefined);
    load(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted && !isCancel(cause)) setError(errorMessage(cause));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // `load` is a new function on every render; `deps` says when it really changes.
  }, [...deps, attempt]);

  const reload = useCallback(() => setAttempt((current) => current + 1), []);

  return { data, loading, error, reload };
}
