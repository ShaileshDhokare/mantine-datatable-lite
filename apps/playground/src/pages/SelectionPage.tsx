import { useState } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  DataTable,
  Icon,
  type DataTableColumn,
  type RowId,
  type SelectionSnapshot,
} from 'mantine-datatable-lite';
import { useScenario } from '../useScenario';
import { PlaygroundLayout } from '../components/PlaygroundLayout';
import { employees, type Employee } from '../data';

const scenarios = [
  {
    id: 'all',
    label: 'Select any row',
    description:
      'Select individual rows or all visible rows, then use the bulk toolbar.',
  },
  {
    id: 'eligible',
    label: 'Selectable rows',
    description: 'Only active employees can be selected in this example.',
  },
] as const;
const columns: DataTableColumn<Employee>[] = [
  { dataIndex: 'name', header: 'Name' },
  { dataIndex: 'department', header: 'Department' },
  { dataIndex: 'role', header: 'Role' },
  {
    dataIndex: 'isActive',
    header: 'Status',
    render: (row) => (row.isActive ? 'Active' : 'Inactive'),
  },
];

export function SelectionPage() {
  const [active, setActive] = useScenario(scenarios);
  const [rows, setRows] = useState(employees.slice(0, 12));
  const [selectedIds, setSelectedIds] = useState<RowId[]>([]);
  const [pendingDelete, setPendingDelete] = useState<Employee[]>([]);

  function selectedRows() {
    return rows.filter((row) => selectedIds.includes(row.id));
  }
  function onSelectionChange(snapshot: SelectionSnapshot<Employee>) {
    setSelectedIds(snapshot.ids);
  }

  return (
    <PlaygroundLayout
      section='selection'
      scenarios={scenarios}
      active={active}
      onSelect={(next) => {
        setActive(next);
        setSelectedIds([]);
      }}
      controls={
        <Stack gap='xs'>
          <Text size='sm'>
            {selectedIds.length} selected of {rows.length} rows
          </Text>
          <Button
            size='xs'
            variant='light'
            onClick={() => {
              setRows(employees.slice(0, 12));
              setSelectedIds([]);
            }}
          >
            Restore rows
          </Button>
        </Stack>
      }
    >
      <DataTable
        columns={columns}
        rows={rows}
        withTableBorder
        withRowBorders
        toolbar
        toolbarActions={[
          <Tooltip key='log' label='Log selected rows'>
            <ActionIcon
              aria-label='Log selected rows'
              variant='default'
              size='lg'
              onClick={() => console.log(selectedRows())}
            >
              <Icon name='show' size={20} />
            </ActionIcon>
          </Tooltip>,
        ]}
        selection={{
          selectedIds,
          onChange: onSelectionChange,
          isSelectable:
            active === 'eligible' ? (row) => row.isActive : undefined,
          renderBulkActions: ({ loadedRows }) => (
            <Group gap='xs'>
              <Tooltip label='Delete selected rows'>
                <ActionIcon
                  aria-label='Delete selected rows'
                  variant='default'
                  size='lg'
                  onClick={() => {
                    console.log(loadedRows);
                    setPendingDelete(selectedRows());
                  }}
                >
                  <Icon name='delete' size={20} />
                </ActionIcon>
              </Tooltip>
            </Group>
          ),
        }}
      />
      <Modal
        opened={pendingDelete.length > 0}
        onClose={() => setPendingDelete([])}
        title='Delete selected rows?'
        centered
      >
        <Text size='sm'>
          Delete {pendingDelete.length} selected employee rows from this
          example?
        </Text>
        <Group justify='flex-end' mt='lg'>
          <Button variant='default' onClick={() => setPendingDelete([])}>
            Cancel
          </Button>
          <Button
            color='red'
            onClick={() => {
              const ids = new Set(pendingDelete.map((row) => row.id));
              setRows((current) => current.filter((row) => !ids.has(row.id)));
              setSelectedIds([]);
              setPendingDelete([]);
            }}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </PlaygroundLayout>
  );
}
