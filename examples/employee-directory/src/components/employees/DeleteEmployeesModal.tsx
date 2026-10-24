import { Button, Group, Modal, Text } from '@mantine/core';
import type { RowId } from 'mantine-datatable-lite';

/** Employees waiting for confirmation, and how to name them in the dialog. */
export type DeleteTarget = { ids: RowId[]; label: string };

type DeleteEmployeesModalProps = {
  target: DeleteTarget | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: (target: DeleteTarget) => void;
};

export function DeleteEmployeesModal({
  target,
  deleting,
  onCancel,
  onConfirm,
}: DeleteEmployeesModalProps) {
  return (
    <Modal
      opened={target !== null}
      onClose={() => !deleting && onCancel()}
      title={<Text fw={600}>Delete employees?</Text>}
      centered
    >
      <Text size='sm'>
        Delete {target?.label}? You can restore everything with Reset demo data.
      </Text>
      <Group justify='flex-end' mt='lg'>
        <Button variant='default' disabled={deleting} onClick={onCancel}>
          Cancel
        </Button>
        <Button color='red' loading={deleting} onClick={() => target && onConfirm(target)}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
