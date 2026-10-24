import { useEffect, useState } from 'react';
import type { TableChange } from 'mantine-datatable-lite';
import { errorMessage, isCancel, queryEmployees, type EmployeePage } from './api';

/**
 * Owns the request lifecycle for a server-mode table:
 * - `request` stays null until the table reports its first request on mount.
 * - Each new request aborts the previous one, so late responses never win.
 * - The last good page stays on screen while loading or after an error.
 */
export function useEmployeeQuery() {
  const [request, setRequest] = useState<TableChange | null>(null);
  const [version, setVersion] = useState(0);
  const [page, setPage] = useState<EmployeePage>({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!request) return;
    const controller = new AbortController();
    setLoading(true);
    setError(undefined);
    queryEmployees(request, controller.signal)
      .then(setPage)
      .catch((cause: unknown) => {
        if (!isCancel(cause)) setError(errorMessage(cause));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [request, version]);

  return {
    request,
    /** Pass to the table's onChange. */
    setRequest,
    ...page,
    loading,
    error,
    /** Fetch the current request again, e.g. after a mutation or an error. */
    refresh: () => setVersion((current) => current + 1),
  };
}
