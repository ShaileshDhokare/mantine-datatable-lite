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

In client mode, string choices are derived from the records and shown as-is. In server mode, supply complete string `filterOptions`: a single page cannot describe every available value. Boolean filters always offer true and false; use `filterOptions` with the values `"true"` and `"false"` for your own labels.

Use `filterFn` to replace the local predicate or `renderFilter` to build custom draft controls.

Date filters use the browser's native date input. For Mantine's date picker, install `@mantine/dates` and `dayjs`, import `@mantine/dates/styles.css`, and pass `dateInput={DatePickerInput}`.
