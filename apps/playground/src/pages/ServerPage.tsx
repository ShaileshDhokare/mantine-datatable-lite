import { useState } from 'react';
import { ActionIcon, Badge, Code, Modal, ScrollArea, Stack, Text, Tooltip } from '@mantine/core';
import { DataTable, Icon, type DataTableColumn, type RowId, type TableChange } from '@scope/mantine-datatable-lite';
import { PlaygroundLayout } from '../components/PlaygroundLayout';
import type { Employee } from '../data';
import { fetchEmployeePage } from '../serverEmployees';
import { useServerData } from '../useServerData';

const scenarios = [{
  id: 'server',
  label: 'Server-owned data',
  description: 'Sort, filter, search, and page while the table receives only the requested rows.',
}] as const;

const departmentOptions = [
  'Customer Support', 'Data', 'Design', 'Engineering', 'Executive', 'Finance',
  'Human Resources', 'IT', 'Legal', 'Marketing', 'Operations', 'Product', 'Sales',
];

const columns: DataTableColumn<Employee>[] = [
  { dataIndex: 'name', header: 'Name', sortable: true, searchable: true, showMenu: true },
  { dataIndex: 'email', header: 'Email', searchable: true },
  { dataIndex: 'department', header: 'Department', sortable: true, filterable: true,
    filterOptions: departmentOptions, searchable: true, showMenu: true },
  { dataIndex: 'role', header: 'Role', sortable: true, searchable: true },
  { dataIndex: 'salary', header: 'Salary', type: 'number', sortable: true, filterable: true,
    render: (row) => `$${row.salary.toLocaleString()}` },
  { dataIndex: 'isActive', header: 'Status', type: 'boolean', filterable: true,
    filterOptions: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }],
    render: (row) => <Badge color={row.isActive ? 'teal' : 'gray'} variant='light'>
      {row.isActive ? 'Active' : 'Inactive'}
    </Badge> },
];

const initialRequest: TableChange = {
  pagination: { currentPage: 1, pageSize: 10, totalItems: 0, from: 0, to: 0 },
  filters: [], columnSearch: [], searchQuery: '',
};

export function ServerPage() {
  const [request, setRequest] = useState<TableChange>(initialRequest);
  const [selectedIds, setSelectedIds] = useState<RowId[]>([]);
  const [bulkRequestIds, setBulkRequestIds] = useState<RowId[] | null>(null);
  const { rows, totalItems, loading, error, retry } = useServerData<Employee>(request, fetchEmployeePage);

  return <PlaygroundLayout section='server' scenarios={scenarios} active='server'
    onSelect={() => {}} controls={<Stack gap='xs'>
      <Text size='sm'>Only {rows.length} rows are supplied to the table.</Text>
      <Text size='sm' c='dimmed'>Every change fetches the public JSON with the request in its URL.
        This static file ignores query parameters, so the example applies them and returns one page.</Text>
      <Text size='sm' c='dimmed'>Select rows on two pages, then preview the bulk request. It contains
        every selected ID, including IDs from pages that are no longer loaded.</Text>
    </Stack>}>
    <DataTable columns={columns} rows={rows} globalSearch showTableStatePills showReset toolbar
      selection={{
        selectedIds,
        onChange: ({ ids }) => setSelectedIds(ids),
        renderBulkActions: ({ ids }) => (
          <Tooltip label='Preview bulk request'>
            <ActionIcon aria-label='Preview bulk request' variant='default' size='lg'
              onClick={() => setBulkRequestIds([...ids])}>
              <Icon name='show' size={20} />
            </ActionIcon>
          </Tooltip>
        ),
      }}
      pagination={{ currentPage: request.pagination?.currentPage ?? 1,
        pageSize: request.pagination?.pageSize ?? 10, totalItems }}
      onChange={setRequest} loading={loading} error={error} onRetry={retry}
      minWidth={1050} withTableBorder withRowBorders />
    <Modal opened={bulkRequestIds !== null} onClose={() => setBulkRequestIds(null)}
      title='Bulk request payload' centered>
      <Text size='sm' mb='sm'>Send these selected IDs to your backend for a bulk action:</Text>
      <ScrollArea.Autosize mah={400}>
        <Code block>{JSON.stringify({ ids: bulkRequestIds ?? [] }, null, 2)}</Code>
      </ScrollArea.Autosize>
    </Modal>
  </PlaygroundLayout>;
}
