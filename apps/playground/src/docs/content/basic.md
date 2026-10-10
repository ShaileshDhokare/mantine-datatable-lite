Pass your records as `rows` and describe each column with `dataIndex` and `header`. Column definitions are generic, so `render` receives your record type.

```tsx
import { DataTable, type DataTableColumn } from 'mantine-datatable-lite';
import { employees, type Employee } from './data';

const columns: DataTableColumn<Employee>[] = [
  { dataIndex: 'name', header: 'Name' },
  { dataIndex: 'department', header: 'Department' },
  { dataIndex: 'salary', header: 'Salary', align: 'right',
    render: (row) => `$${row.salary.toLocaleString()}` },
];

export function Demo() {
  return <DataTable rows={employees} columns={columns} />;
}
```

Sorting, filtering, searching and toolbar controls are opt-in. Start with a plain table, then enable the features your screen needs.

Use the scenarios below to explore borders, spacing, theme colors, scrolling and custom rendering. `minWidth` creates horizontal scrolling; `maxHeight` creates a height-limited container for `stickyHeader`.
