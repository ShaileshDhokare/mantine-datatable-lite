Your application owns fetching. Set `mode="server"`, pass the current page to `rows` and the matching total to `pagination`, and use `onChange` to receive the complete request: pagination, sorter, filters, column search and global search.

```tsx
import { useState } from 'react';
import { DataTable, type TableChange } from 'mantine-datatable-lite';
import { useServerData } from './useServerData';
import { fetchEmployeePage } from './serverEmployees';

export function Demo() {
  // Filled by the table's first request on mount, including column defaults.
  const [request, setRequest] = useState<TableChange | null>(null);
  const result = useServerData(request, fetchEmployeePage);
  return <DataTable mode='server'
    columns={[{ dataIndex: 'name', header: 'Name', sortable: true }]}
    rows={result.rows} pagination={{
      currentPage: request?.pagination?.currentPage ?? 1,
      pageSize: request?.pagination?.pageSize ?? 10,
      totalItems: result.totalItems,
    }} onChange={setRequest} loading={result.loading}
    error={result.error} onRetry={result.retry} />;
}
```

In server mode `onChange` fires once on mount with the initial request, then immediately for every sort, filter, search, page or size change. Only global search typing is debounced (`debounceTime`, 300 ms by default).

`loading` places an overlay over the previous rows. Supply `error` and `onRetry` to show a retry action. Neither fetching nor error state is owned by the package.

The source tabs include a consumer hook that aborts obsolete requests, rejects stale responses and retains the last successful page on failure. Replace the static fetch adapter with your API or your preferred data library.

> This demo fetches a static `employees.json` file on every request. GitHub Pages ignores its query parameters, so the adapter applies the requested operations locally and returns one page. The browser Network panel shows the URL contract a real backend would receive.

Supply complete string `filterOptions` for remote data; boolean filters offer true and false automatically. Pagination requests contain `currentPage` and `pageSize`. Selection retains IDs across pages; `loadedRows` contains only currently loaded selected records. Send `ids` when acting on selections from multiple pages.
