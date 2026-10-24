This example combines sorting, typed filters, column and global search, visibility controls, state pills, pinning, expansion, selection and pagination over 100 deterministic employee records.

```tsx
<DataTable columns={columns} rows={employees}
  pagination={{ pageSizeOptions: [10, 20, 50] }}
  globalSearch columnSelector showTableStatePills showReset
  selection={selection} expandable={expandable} />
```

This is a composition sketch; the source tabs contain the complete column definitions. The table filters, searches, sorts and pages all 100 records itself.

Try a department filter, search within those results, sort salary, then move to another page. The footer total reflects the matching rows. Custom cell renderers keep their own presentation while sorting and filtering compare the underlying values.
