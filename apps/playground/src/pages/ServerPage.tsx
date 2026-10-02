import { useState } from 'react';
import { Badge, Stack, Text } from '@mantine/core';
import { DataTable, type DataTableColumn, type TableChange } from '@scope/mantine-datatable-lite';
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
  const { rows, totalItems, loading, error, retry } = useServerData<Employee>(request, fetchEmployeePage);

  return <PlaygroundLayout section='server' scenarios={scenarios} active='server'
    onSelect={() => {}} controls={<Stack gap='xs'>
      <Text size='sm'>Only {rows.length} rows are supplied to the table.</Text>
      <Text size='sm' c='dimmed'>Every change fetches the public JSON with the request in its URL.
        This static file ignores query parameters, so the example applies them and returns one page.</Text>
    </Stack>}>
    <DataTable columns={columns} rows={rows} globalSearch showTableStatePills showReset
      pagination={{ currentPage: request.pagination?.currentPage ?? 1,
        pageSize: request.pagination?.pageSize ?? 10, totalItems }}
      onChange={setRequest} loading={loading} error={error} onRetry={retry}
      minWidth={1050} withTableBorder withRowBorders />
  </PlaygroundLayout>;
}
