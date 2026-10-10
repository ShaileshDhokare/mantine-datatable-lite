Set `sortable: true` on a column. Clicking its heading cycles through ascending, descending and unsorted. Set `type` for numeric, date and boolean comparisons; the default is string comparison. Missing and invalid numeric/date values sort last.

```tsx
const columns: DataTableColumn<Employee>[] = [
  { dataIndex: 'name', header: 'Name', sortable: true },
  { dataIndex: 'salary', header: 'Salary', type: 'number', sortable: true },
  { dataIndex: 'department', header: 'Department', sortable: true,
    defaultSortOrder: 'asc',
    sortFn: (a, b) => a.department.length - b.department.length },
];

<DataTable columns={columns} rows={employees} />
```

`sortFn` defines the ascending comparison; the table reverses it for descending order. Only one column is sorted at a time. `showMenu` exposes explicit sort actions, and `showSortIcon: false` hides the dedicated icon.

Without `pagination`, the table sorts a copy of your records locally. With `pagination`, handle `onChange.sorter` and supply the sorted page yourself. See [server-side data](#/server) for the complete request flow.
