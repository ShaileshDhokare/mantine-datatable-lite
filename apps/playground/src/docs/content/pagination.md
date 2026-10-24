Add `pagination` to page your records in the browser. The table counts the matching rows and slices the current page after filtering, searching and sorting.

```tsx
import { DataTable } from 'mantine-datatable-lite';
import { employees } from './data';

export function Demo() {
  return <DataTable columns={[{ dataIndex: 'name', header: 'Name' }]}
    rows={employees} pagination={{ pageSize: 10 }} />;
}
```

`pagination` also accepts `true` for the defaults. In client mode, `currentPage` and `pageSize` set the starting page and size, and `onChange` reports each page change.

The default size choices are 10, 20, 50 and 100. Use `pageSizeOptions: false` for a fixed size or provide your own list. Size, sort, filter and search changes return to page 1. When the rows shrink, the table shows the last available page. With no records, the footer stays visible with disabled controls.

When your server owns paging, set `mode="server"`, pass the controlled `currentPage`, `pageSize` and `totalItems`, and supply only the current page in `rows`. See [server-side data](#/server).
