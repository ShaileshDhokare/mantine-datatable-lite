Set `filterable: true` and choose a column `type`: string and boolean use value choices; number and date use comparison operators. Filters on different columns combine with AND.

```tsx
const columns: DataTableColumn<Employee>[] = [
  { dataIndex: 'name', header: 'Name' },
  { dataIndex: 'department', header: 'Department', filterable: true,
    filterOptions: ['Engineering', 'Design', 'Sales'],
    defaultFilterValue: ['Engineering'], searchableFilter: true },
  { dataIndex: 'salary', header: 'Salary', type: 'number', filterable: true },
];

<DataTable columns={columns} rows={employees} showTableStatePills showReset />
```

Changes stay in the filter draft until **Apply**. **Reset** clears that column's filter. Between uses inclusive bounds. Null values do not match an active filter.

For local data, choices can be derived from the records. Supply complete `filterOptions` when you pass a paginated slice: a single page cannot describe every available value. Boolean option values use the strings `"true"` and `"false"` with your own labels.

Use `filterFn` to replace the local predicate or `renderFilter` to build custom draft controls. Date controls require `@mantine/dates/styles.css`.
