import { Button, Group } from '@mantine/core';

export type ServerAction = 'activate' | 'deactivate' | 'delete';

type ServerBulkActionsProps = {
  running: ServerAction | null;
  onSetActive: (isActive: boolean) => void;
  onDelete: () => void;
};

/** Bulk action bar content. The selected IDs can span pages, so the API does the work. */
export function ServerBulkActions({ running, onSetActive, onDelete }: ServerBulkActionsProps) {
  const busy = running !== null;
  return (
    <Group gap='xs' wrap='nowrap'>
      <Button
        size='xs'
        variant='light'
        loading={running === 'activate'}
        disabled={busy && running !== 'activate'}
        onClick={() => onSetActive(true)}
      >
        Activate
      </Button>
      <Button
        size='xs'
        variant='light'
        color='gray'
        loading={running === 'deactivate'}
        disabled={busy && running !== 'deactivate'}
        onClick={() => onSetActive(false)}
      >
        Deactivate
      </Button>
      <Button size='xs' variant='light' color='red' disabled={busy} onClick={onDelete}>
        Delete
      </Button>
    </Group>
  );
}
