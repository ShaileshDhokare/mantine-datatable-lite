import { DataTable, type DataTableColumn } from 'mantine-datatable-lite';

type Person = { id: number; name: string; role: string };
const rows: Person[] = [
  { id: 1, name: 'Olivia Chen', role: 'Engineer' },
  { id: 2, name: 'Noah Patel', role: 'Designer' },
  { id: 3, name: 'Ava Thompson', role: 'Product manager' },
];
const columns: DataTableColumn<Person>[] = [
  { dataIndex: 'name', header: 'Name', sortable: true },
  { dataIndex: 'role', header: 'Role', filterable: true },
];
export function GettingStarted() {
  return <DataTable rows={rows} columns={columns} withTableBorder />;
}
