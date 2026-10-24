import type { TableChange } from 'mantine-datatable-lite';
import { useState } from 'react';
import { queryEmployees } from '../../api/employees';
import { useAsyncData } from '../../hooks/useAsyncData';

/**
 * The request lifecycle of a server-side table:
 * - `request` stays null until the table reports its first request on mount.
 * - Each new request aborts the previous one, so late responses never win.
 * - The last good page stays on screen while loading. After an error the table
 *   shows the message and Retry instead, and keeps the page for the next success.
 */
export function useEmployeeQuery() {
  const [request, setRequest] = useState<TableChange | null>(null);
  const page = useAsyncData(
    request ? (signal) => queryEmployees(request, signal) : null,
    [request],
  );

  return {
    request,
    /** Pass to the table's `onChange`. */
    setRequest,
    rows: page.data?.rows ?? [],
    total: page.data?.total ?? 0,
    /** False until the first page arrives. */
    loaded: page.data !== undefined,
    loading: page.loading,
    error: page.error,
    /** Fetches the current request again, e.g. after a change or an error. */
    refresh: page.reload,
  };
}
