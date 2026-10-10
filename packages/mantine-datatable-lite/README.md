# mantine-datatable-lite

A typed React DataTable built with Mantine components. Sorting, typed filters,
search, caller-owned pagination, sticky columns, selection, expandable rows, and
row actions are included, with **no additional runtime dependencies** beyond the
React and Mantine peer dependencies.

**Alpha release: `0.1.0-alpha.0`.** The API may change during alpha releases. Pin
an exact version when upgrading deliberately.

## Compatibility

| Peer dependency | Supported range |
| --- | --- |
| `react` and `react-dom` | `^19.3.0` |
| `@mantine/core` | `^9.6.0` |
| `@mantine/hooks` | `^9.6.0` |
| `@mantine/dates` | `^9.6.0` |

This release targets **React 19 and Mantine 9**, starting at the versions above.
React 18, Mantine 8, and earlier minor versions outside these ranges are not
supported or tested. Keep React/React DOM on matching versions and the Mantine
packages on matching versions. `@mantine/dates` is required, including when the
application does not enable date filters, because the filter UI imports it.

## Install

```sh
npm install --save-exact mantine-datatable-lite@alpha
npm install react@^19.3.0 react-dom@^19.3.0 @mantine/core@^9.6.0 @mantine/hooks@^9.6.0 @mantine/dates@^9.6.0
```

An existing compatible Mantine app only needs the first command. TypeScript apps
also need React 19 type declarations (`@types/react` and `@types/react-dom`).

## Quick start

Import Mantine's CSS first, then the table's CSS, once at your app entry point.
Render the table inside `MantineProvider`.

```tsx
import { MantineProvider } from '@mantine/core';
import { DataTable, type DataTableColumn } from 'mantine-datatable-lite';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-datatable-lite/styles.css';

type Employee = { id: number; name: string; age: number };

const rows: Employee[] = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 26 },
];

const columns: DataTableColumn<Employee>[] = [
  {
    dataIndex: 'name',
    header: 'Name',
    type: 'string',
    sortable: true,
    filterable: true,
    searchable: true,
    showMenu: true,
  },
  { dataIndex: 'age', header: 'Age', type: 'number', sortable: true },
];

export function App() {
  return (
    <MantineProvider>
      <DataTable
        rows={rows}
        columns={columns}
        globalSearch
        columnSelector
        showTableStatePills
        showReset
        withTableBorder
        highlightOnHover
      />
    </MantineProvider>
  );
}
```

In an app already wrapped in `MantineProvider`, use `DataTable` directly.
Columns infer their row type from `rows`, or you can specify `DataTable<Employee>`.

## Features

- Single-column sorting with typed comparisons and custom `sortFn`.
- String, boolean, numeric, and date filters, custom options, and `renderFilter`.
- Column search and debounced global search; default cells highlight matches.
- Caller-owned pagination, page size controls, loading overlay, error, and retry.
- Column menus, visibility picker, left/right pinning, and sticky headers.
- Optional persistence of hidden and pinned column IDs through `persistKey`.
- Controlled row selection, all-visible tri-state checkbox, and bulk actions.
- Controlled or local expansion and a `rowActionsColumn` helper.
- Mantine borders, spacing, colors, and light/dark theme integration.

## Data ownership and pagination

Without `pagination`, the table filters, searches, and sorts the supplied `rows`
locally, in that order. With `pagination`, **the caller owns every data operation**.
The table renders `rows` as supplied and reports a complete `TableChange` through
`onChange`. Fetch/filter/sort first and supply the resulting page yourself.

```tsx
import { DataTable, type TableChange } from 'mantine-datatable-lite';

// page, loading, error, handleChange, and retry are application-owned state/functions.
<DataTable
  rows={page.rows}
  columns={columns}
  pagination={{ currentPage: page.number, pageSize: 20, totalItems: page.total }}
  onChange={(request: TableChange) => handleChange(request)}
  loading={loading}
  error={error}
  onRetry={retry}
/>;
```

`TableChange` contains `pagination?`, `sorter?`, `filters`, `columnSearch`, and
`searchQuery`. Pagination callbacks include `currentPage`, `pageSize`,
`totalItems`, `from`, and `to`. Sorting, filtering, and searching reset the page
to 1. The default page size choices are `[10, 20, 50, 100]`; set
`pagination.pageSizeOptions` to `false` to hide the size picker.

The table does not fetch data. Initiate the first request in your application and
handle request cancellation and stale responses there. See the
[server example](https://github.com/ShaileshDhokare/mantine-datatable-lite/blob/master/apps/playground/src/pages/ServerPage.tsx).

For TypeScript 6 with `skipLibCheck: false`, the Mantine peer declarations also
need current library definitions (for example `lib: ["ESNext", "DOM"]`) and a
CSS module declaration such as `declare module '*.css';` (Vite supplies this
through `vite/client`).

## Columns and filters

Every column requires a unique `dataIndex` and a `header`. `dataIndex` reads a
direct row property; dotted paths are not resolved. Use `render(row, index)` for
custom cells, and a matching row property or custom predicates for data operations.

Sorting, filtering, column search, and menus are opt in through `sortable`,
`filterable`, `searchable`, and `showMenu`. Header control icons are configured
through `showSortIcon`, `showFilterIcon`, and `showSearchIcon`. Global search
checks all columns except those explicitly marked `searchable: false`.

| Column option | Purpose |
| --- | --- |
| `type` | `'string'`, `'number'`, `'boolean'`, or `'date'` |
| `defaultSortOrder`, `sortFn` | Initial ordering or a custom comparator |
| `defaultFilterValue`, `filterFn`, `renderFilter` | Initial/custom filtering |
| `filterOptions`, `searchableFilter` | Explicit choices and choice search |
| `defaultSearchValue` | Initial column search |
| `width`, `align` | Cell width and text alignment |
| `sticky`, `pinnable` | Initial left/right pin and menu pin actions |
| `menuOptions` | Limit the menu to sort/filter/search/pin/display actions |
| `hideable` | Allow hiding the column |

Filter value shapes match the actual public types:

```ts
import type { FilterValue } from 'mantine-datatable-lite';

const department: FilterValue = ['Engineering', 'Design'];
const active: FilterValue = [true];
const minimumAge: FilterValue = { operator: 'gte', value: 18 };
const ageRange: FilterValue = { operator: 'between', value: [18, 65] };
const joinedAfter: FilterValue = { operator: 'gte', value: new Date('2026-01-01') };
```

Numeric/date operators are `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, and `between`.
`between` requires two bounds. Filter and search controls keep drafts local until
Apply. Hidden columns retain active filters/searches. Reset clears sort, filters,
search, and hidden columns. Persisted layout contains only hidden/pinned IDs.

## Selection, expansion, and row actions

Use a unique, stable string or finite numeric `row.id`, or specify `idAccessor`.
Missing/duplicate IDs disable selection and expansion for affected rows. IDs
must remain unique across server pages.

```tsx
import { useState } from 'react';
import { Button } from '@mantine/core';
import { DataTable, rowActionsColumn, type RowId } from 'mantine-datatable-lite';

function EmployeeTable() {
  const [selectedIds, setSelectedIds] = useState<RowId[]>([]);

  return (
    <DataTable
      rows={rows}
      columns={[
        ...columns,
        rowActionsColumn<Employee>({
          render: (row) => <Button size='xs' onClick={() => alert(row.name)}>View</Button>,
        }),
      ]}
      idAccessor='id'
      toolbar
      selection={{
        selectedIds,
        onChange: ({ ids }) => setSelectedIds(ids),
        renderBulkActions: ({ count, clear }) => (
          <Button onClick={clear}>Clear {count} selected</Button>
        ),
      }}
      expandable={{ render: (row) => <div>Age: {row.age}</div> }}
    />
  );
}
```

Selection is controlled and can accumulate IDs across pages. `loadedRows` in the
selection snapshot contains selected rows available in the supplied data;
it does not fetch missing rows. Query changes reset selection. With `toolbar`,
bulk actions appear when more than one row is selected.

Expansion supports `expandedIds`, `onChange`, `allowMultiple`, and
`trigger: 'icon' | 'row'`. Row-action cells prevent action clicks from invoking
the row click handler or row-triggered expansion.

## Public exports

Import from the package root. ESM and CommonJS builds include matching TypeScript
declarations. Import CSS through `mantine-datatable-lite/styles.css`.

| Export | Use |
| --- | --- |
| `DataTable` | Generic React table component |
| `Icon` | Inline SVG component with `name`, `size`, and standard SVG props |
| `rowActionsColumn` | Typed action-column factory |
| `DataTableProps`, `DataTableColumn`, `ColumnType` | Table/column definitions |
| `IconProps`, `IconName`, `MenuOption` | Icon and menu definitions |
| `Sorter`, `SortOrder` | Sort request |
| `Filter`, `FilterValue`, `FilterOption`, `FilterRenderContext` | Filter definitions |
| `StringFilterValue`, `BooleanFilterValue`, `NumericFilterValue`, `DateFilterValue`, `NumericOperator` | Typed filter values |
| `ColumnSearch`, `TableChange` | Search and complete change request |
| `Pagination`, `PaginationChange` | Page state and callback data |
| `RowId`, `IdAccessor`, `PinnedColumns` | Identity and pin definitions |
| `SelectionConfig`, `SelectionSnapshot`, `ExpandableConfig` | Selection and expansion definitions |

Internal hooks, context, header/footer components, and utilities are not public
exports. There is no public headless `useDataTable` hook in this alpha.

## Scope

This alpha does not provide virtualization, cell editing, tree/grouped data,
multi-column sorting, column resizing, row drag and drop, built-in CSV/Excel
export, or one-click selection of every matching server row. Large data sets
should use caller-owned pagination.

Custom Styles API slots are not part of the current table API. Configure the
exposed Mantine styling props and your Mantine theme.

## Examples and feedback

The [playground source](https://github.com/ShaileshDhokare/mantine-datatable-lite/tree/master/apps/playground)
contains basic, sorting, filtering, search, pagination, server, pinning, expansion,
selection, and combined examples.

Report alpha issues through
[GitHub issues](https://github.com/ShaileshDhokare/mantine-datatable-lite/issues),
including the package, React, and Mantine versions and a small reproduction.

## License

MIT. Inline SVG attribution and licenses are included in `THIRD_PARTY_NOTICES`.
