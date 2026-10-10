import { useState } from 'react';
import { ActionIcon, Text, Tooltip } from '@mantine/core';
import { DataTable, Icon, rowActionsColumn, type DataTableColumn } from 'mantine-datatable-lite';
import { employees, type Employee } from '../data';

export function RowActions() {
  const [message, setMessage] = useState('Choose a row or open its details action.');
  const columns: DataTableColumn<Employee>[] = [
    { dataIndex: 'name', header: 'Name' },
    { dataIndex: 'department', header: 'Department' },
    rowActionsColumn<Employee>({ render: (row) => (
      <Tooltip label={`View ${row.name}`}>
        <ActionIcon aria-label={`View ${row.name}`} variant='subtle'
          onClick={() => setMessage(`Details action: ${row.name}`)}>
          <Icon name='show' />
        </ActionIcon>
      </Tooltip>
    ) }),
  ];
  return <>
    <DataTable rows={employees.slice(0, 5)} columns={columns} withTableBorder
      onRowClick={(row) => setMessage(`Row click: ${row.name}`)} />
    <Text size='sm' c='dimmed' mt='md' aria-live='polite'>{message}</Text>
  </>;
}
