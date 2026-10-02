import { useState } from 'react';
import { Stack, Text } from '@mantine/core';
import { DataTable, type DataTableColumn } from '@scope/mantine-datatable-lite';
import { PlaygroundLayout } from '../components/PlaygroundLayout';
import { employees, type Employee } from '../data';

const scenarios = [
  { id: 'menu', label: 'Pin from menu', description: 'Pin columns to either side and move pinned columns one position at a time.' },
  { id: 'initial', label: 'Initially pinned', description: 'Name and status start pinned; use their menus to rearrange or unpin them.' },
] as const;

export function PinningPage() {
  const [active, setActive] = useState<(typeof scenarios)[number]['id']>('menu');
  const columns: DataTableColumn<Employee>[] = [
    { dataIndex: 'id', header: 'ID', width: 80, showMenu: true },
    { dataIndex: 'name', header: 'Name', width: 190, showMenu: true, sticky: active === 'initial' ? 'left' : undefined },
    { dataIndex: 'email', header: 'Email', width: 270, showMenu: true },
    { dataIndex: 'department', header: 'Department', width: 170, showMenu: true },
    { dataIndex: 'role', header: 'Role', width: 210, showMenu: true },
    { dataIndex: 'salary', header: 'Salary', width: 140, showMenu: true, render: (row) => `$${row.salary.toLocaleString()}` },
    { dataIndex: 'isActive', header: 'Status', width: 130, showMenu: true,
      sticky: active === 'initial' ? 'right' : undefined,
      render: (row) => row.isActive ? 'Active' : 'Inactive' },
  ];
  return <PlaygroundLayout section='pinning' scenarios={scenarios} active={active}
    onSelect={setActive} controls={<Stack gap='xs'><Text size='sm'>Open a column menu and choose Pin.</Text>
      <Text size='sm'>Use Move left or Move right to reorder columns pinned on the same side.</Text></Stack>}>
    <DataTable key={active} columns={columns} rows={employees.slice(0, 12)} minWidth={1250}
      maxHeight={420} stickyHeader withTableBorder withRowBorders striped />
  </PlaygroundLayout>;
}
