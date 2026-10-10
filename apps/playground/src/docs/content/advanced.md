This example combines sorting, typed filters, column and global search, visibility controls, state pills, pinning, expansion, selection and pagination over 100 deterministic employee records.

```tsx
// With pagination, transform the full dataset before taking a page.
const matched = queryEmployees(employees, state);
const rows = matched.slice(
  (state.page - 1) * state.pageSize,
  state.page * state.pageSize,
);

<DataTable columns={columns} rows={rows}
  pagination={{ currentPage: state.page, pageSize: state.pageSize,
    totalItems: matched.length }}
  globalSearch columnSelector showTableStatePills showReset
  toolbar selection={selection} expandable={expandable}
  onChange={handleChange} />
```

This is a composition sketch; the source tabs contain the complete state, column definitions and query helper. `queryEmployees` is a demo helper, not a package export.

Try a department filter, search within those results, sort salary, then move to another page. The total reflects the matching dataset. Custom cell renderers retain their own presentation while the query helper compares raw values.
