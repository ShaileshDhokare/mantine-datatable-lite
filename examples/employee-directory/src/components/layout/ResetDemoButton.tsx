import { Button } from '@mantine/core';
import { resetDemoData } from '../../api/employees';
import { useAsyncAction } from '../../hooks/useAsyncAction';

/** Restores the original employees on the server, then calls `onReset`. */
export function ResetDemoButton({ onReset }: { onReset: () => void }) {
  const { running, run } = useAsyncAction<'reset'>();

  async function reset() {
    const done = await run('reset', async () => {
      await resetDemoData();
      return 'Demo data restored.';
    });
    if (done) onReset();
  }

  return (
    <Button variant='default' loading={running === 'reset'} onClick={reset}>
      Reset demo data
    </Button>
  );
}
