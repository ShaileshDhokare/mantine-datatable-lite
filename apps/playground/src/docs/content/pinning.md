Set `showMenu: true` to expose **Pin to left** and **Pin to right**. Use `sticky` to provide an initial pinned position. Give pinned columns a predictable width and make the table wider than its container to explore horizontal scrolling.

```tsx
const columns: DataTableColumn<Employee>[] = [
  { dataIndex: 'name', header: 'Name', width: 190, sticky: 'left', showMenu: true },
  { dataIndex: 'email', header: 'Email', width: 270, showMenu: true },
  { dataIndex: 'department', header: 'Department', width: 170, showMenu: true },
  { dataIndex: 'role', header: 'Role', width: 210, showMenu: true },
];

<DataTable columns={columns} rows={employees} minWidth={900}
  maxHeight={420} stickyHeader columnSelector
  persistKey="employees:layout" />
```

Move a pinned column one position at a time with its menu. `pinnable: false` disables pin actions, and `hideable: false` keeps a column out of visibility controls. A hidden column is removed from the current pinned layout.

`persistKey` remembers hidden and pinned column IDs in localStorage. Saved layouts are versioned and pruned when columns change. Sorting, filters, search, expansion, selection and pagination are not persisted. Remember page size in your own state if needed. Use a distinct key for each table layout.
