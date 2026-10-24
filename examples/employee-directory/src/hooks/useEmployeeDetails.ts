import { useEffect, useState } from 'react';
import { fetchEmployeeDetails } from '../api/employees';
import { errorMessage, isCancel } from '../api/http';
import type { EmployeeDetails } from '../types/employee';

// Details never change for an ID, so each row loads them once per page visit.
const cache = new Map<number, EmployeeDetails>();

type DetailsState = { details?: EmployeeDetails; error?: string };

/** One employee's expanded-row details. A newer attempt, or unmounting, aborts the request. */
export function useEmployeeDetails(id: number) {
  const [state, setState] = useState<DetailsState>(() => ({ details: cache.get(id) }));
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (cache.has(id)) return;
    const controller = new AbortController();
    fetchEmployeeDetails(id, controller.signal)
      .then((details) => {
        cache.set(id, details);
        setState({ details });
      })
      .catch((cause: unknown) => {
        if (!isCancel(cause)) setState({ error: errorMessage(cause) });
      });
    return () => controller.abort();
  }, [id, attempt]);

  return {
    ...state,
    retry: () => {
      setState({});
      setAttempt((current) => current + 1);
    },
  };
}
