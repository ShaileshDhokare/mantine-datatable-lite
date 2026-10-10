import { DataTable } from 'mantine-datatable-lite';
import { employees } from '../data';

export function Theming() {
  return <DataTable columns={[
    { dataIndex: 'name', header: 'Name' },
    { dataIndex: 'department', header: 'Department' },
    { dataIndex: 'role', header: 'Role' },
  ]} rows={employees.slice(0, 5)} striped highlightOnHover withTableBorder
    borderColor='blue.4' horizontalSpacing='md' verticalSpacing='sm'
    stripedColor='var(--mantine-color-blue-light)'
    highlightOnHoverColor='var(--mantine-color-teal-light)' />;
}
