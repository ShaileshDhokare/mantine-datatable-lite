import { DataTable, type DataTableColumn } from 'mantine-datatable-lite';
import { employees, type Employee } from '../data';

const columns: DataTableColumn<Employee>[] = [
  { dataIndex: 'name', header: 'Name', sortable: true, searchable: true },
  { dataIndex: 'department', header: 'Department', filterable: true },
  { dataIndex: 'role', header: 'Role' },
];
export function Toolbar() {
  return <DataTable rows={employees.slice(0, 10)} columns={columns}
    globalSearch columnSelector showTableStatePills showReset
    maxChips={3} withTableBorder />;
}
