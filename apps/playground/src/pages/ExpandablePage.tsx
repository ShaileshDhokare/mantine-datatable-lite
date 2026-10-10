import { useState } from 'react';
import { DataList, Stack, Text } from '@mantine/core';
import { DataTable, type DataTableColumn } from 'mantine-datatable-lite';
import { PlaygroundLayout } from '../components/PlaygroundLayout';
import { employees, type Employee } from '../data';

const scenarios = [
  { id: 'single', label: 'One row at a time', description: 'Expand a row to view details below its cells.' },
  { id: 'multiple', label: 'Multiple rows', description: 'Keep several detail panels open together.' },
  { id: 'row', label: 'Row trigger', description: 'Click anywhere on a row to expand or collapse it.' },
] as const;
const columns: DataTableColumn<Employee>[] = [
  { dataIndex: 'name', header: 'Name' },
  { dataIndex: 'department', header: 'Department' },
  { dataIndex: 'role', header: 'Role' },
];

export function ExpandablePage() {
  const [active, setActive] = useState<(typeof scenarios)[number]['id']>('single');
  return <PlaygroundLayout section='expandable' scenarios={scenarios} active={active}
    onSelect={setActive} controls={<Stack gap='xs'><Text size='sm'>Use the plus and minus controls to show row details.</Text></Stack>}>
    <DataTable key={active} columns={columns} rows={employees.slice(0, 8)} withTableBorder withRowBorders
      expandable={{ allowMultiple: active === 'multiple', trigger: active === 'row' ? 'row' : 'icon',
        render: (row) => <DataList size='sm' orientation='horizontal' withDivider>
          <DataList.Item><DataList.ItemLabel>Email</DataList.ItemLabel><DataList.ItemValue>{row.email}</DataList.ItemValue></DataList.Item>
          <DataList.Item><DataList.ItemLabel>Age</DataList.ItemLabel><DataList.ItemValue>{row.age}</DataList.ItemValue></DataList.Item>
          <DataList.Item><DataList.ItemLabel>Joined</DataList.ItemLabel><DataList.ItemValue>{row.joinDate.toLocaleDateString()}</DataList.ItemValue></DataList.Item>
        </DataList> }} />
  </PlaygroundLayout>;
}
