import { useCallback, useState } from 'react';
import { errorMessage } from '../api/http';
import { notifyError, notifySuccess } from '../utils/notify';

/**
 * Runs actions such as saves and deletes: tracks which one is running, and shows
 * its result as a notification.
 *
 * `run(action, task)` resolves to true when `task` succeeded. The task returns
 * the success message.
 */
export function useAsyncAction<Action extends string>() {
  const [running, setRunning] = useState<Action | null>(null);

  const run = useCallback(async (action: Action, task: () => Promise<string>) => {
    setRunning(action);
    try {
      notifySuccess(await task());
      return true;
    } catch (cause) {
      notifyError(errorMessage(cause));
      return false;
    } finally {
      setRunning(null);
    }
  }, []);

  return { running, run };
}
