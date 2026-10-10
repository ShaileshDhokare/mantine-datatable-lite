Pagination is caller-owned. Pass `currentPage`, `pageSize` and the total number of matching records, then supply only the current page in `rows`.

```tsx
import { useState } from 'react';
import { DataTable } from 'mantine-datatable-lite';
import { employees } from './data';

export function Demo() {
  const [page, setPage] = useState({ currentPage: 1, pageSize: 10 });
  const rows = employees.slice(
    (page.currentPage - 1) * page.pageSize, page.currentPage * page.pageSize,
  );
  return <DataTable columns={[{ dataIndex: 'name', header: 'Name' }]}
    rows={rows} pagination={{ ...page, totalItems: employees.length }}
    onChange={({ pagination }) => {
      if (pagination) setPage(pagination);
    }} />;
}
```

> Supplying `pagination` also disables local sorting, filtering and searching. For a combined client example, transform the complete dataset before slicing it. The [advanced example](#/advanced) shows this order.

The default size choices are 10, 20, 50 and 100. Use `pageSizeOptions: false` for a fixed size or provide your own list. Size, sort, filter and search changes reset to page 1; page changes are reported immediately. When the total shrinks, the table reports a clamped page. With no records, the footer stays visible with disabled controls.
