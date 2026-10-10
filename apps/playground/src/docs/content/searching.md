Column search is opt-in with `searchable: true`. Users can open it from the search icon or from a column menu. Global search is enabled separately with `globalSearch`.

```tsx
const columns: DataTableColumn<Employee>[] = [
  { dataIndex: 'name', header: 'Name', searchable: true, showMenu: true },
  { dataIndex: 'department', header: 'Department', searchable: true },
  { dataIndex: 'salary', header: 'Salary', searchable: false },
];

<DataTable rows={employees} columns={columns}
  globalSearch showTableStatePills showReset />
```

Search uses raw field values, with case-insensitive substring matching. Column terms combine with AND; global search matches any eligible column. Explicit `searchable: false` excludes a column from global search. An omitted `searchable` does not enable the column's search UI but still permits global matching.

Column search drafts apply through **Apply**. Global typing is debounced (300 ms by default). Matching text is highlighted in default-rendered cells; custom `render` output stays under your control. Search combines with filters and sorting.
