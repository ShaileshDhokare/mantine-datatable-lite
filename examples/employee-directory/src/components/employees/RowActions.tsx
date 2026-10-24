import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { Icon } from 'mantine-datatable-lite';
import type { Employee } from '../../types/employee';

type RowActionsProps = {
  employee: Employee;
  onView: (employee: Employee) => void;
  /** Leave out to hide the delete button. */
  onDelete?: (employee: Employee) => void;
};

/** Icon buttons for a table's row actions column. */
export function RowActions({ employee, onView, onDelete }: RowActionsProps) {
  return (
    <Group gap={4} wrap='nowrap'>
      <Tooltip label='View details' withArrow>
        <ActionIcon
          variant='subtle'
          aria-label={`View ${employee.name}`}
          onClick={() => onView(employee)}
        >
          <Icon name='show' size={18} />
        </ActionIcon>
      </Tooltip>
      {onDelete && (
        <Tooltip label='Delete' withArrow>
          <ActionIcon
            variant='subtle'
            color='red'
            aria-label={`Delete ${employee.name}`}
            onClick={() => onDelete(employee)}
          >
            <Icon name='delete' size={18} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}
