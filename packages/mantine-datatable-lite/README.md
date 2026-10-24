# mantine-datatable-lite

A typed React DataTable built with Mantine components. Sorting, typed filters,
search, client or server pagination, sticky columns, selection, expandable rows,
and row actions are included, with **no additional runtime dependencies** beyond
the React and Mantine peer dependencies.

**Prerelease: `0.1.0-alpha.2`.** The API may change before 1.0. Pin an exact
version when upgrading deliberately, and see [Upgrading from earlier
alphas](#upgrading-from-earlier-alphas).

## Compatibility

| Peer dependency | Supported range |
| --- | --- |
| `react` and `react-dom` | `^19.2.0` |
| `@mantine/core` | `^9.6.0` |
| `@mantine/hooks` | `^9.6.0` |

This release targets **React 19 and Mantine 9**, starting at the versions above.
React 18, Mantine 8, and earlier minor versions outside these ranges are not
supported or tested. Keep React/React DOM on matching versions and the Mantine
packages on matching versions. `@mantine/dates` is optional; see
[Date filters](#date-filters).

## Install

```sh
npm install --save-exact mantine-datatable-lite@alpha
npm install react@^19.2.0 react-dom@^19.2.0 @mantine/core@^9.6.0 @mantine/hooks@^9.6.0
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
        pagination
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
The bundle is marked `'use client'`, so it works from React Server Component
frameworks such as the Next.js App Router.

## Features

- Single-column sorting with typed comparisons and custom `sortFn`.
- String, boolean, numeric, and date filters, custom options, and `renderFilter`.
- Column search and debounced global search; default cells highlight matches.
- Client pagination, or server pagination with loading overlay, error, and retry.
- Column menus, visibility picker, left/right pinning, and sticky headers.
- Optional persistence of hidden and pinned column IDs through `persistKey`.
- Controlled or table-managed row selection, a tri-state page checkbox, and bulk actions.
- Controlled or local expansion and a `rowActionsColumn` helper.
- Mantine borders, spacing, colors, light/dark theme integration, and replaceable UI text.

## Client and server mode

`mode` decides who owns the data operations.

**Client mode** (the default): the table filters, searches, and sorts the
supplied `rows`, in that order, then pages them when `pagination` is set.

```tsx
<DataTable rows={employees} columns={columns} pagination={{ pageSize: 20 }} />
```

`pagination` also accepts `true` for the defaults. In client mode
`currentPage` and `pageSize` set the starting page and size; the table counts
the matching rows.

**Server mode**: the table renders `rows` as supplied and reports a complete
`TableChange` through `onChange`. Fetch, filter, sort, and page on your server,
then pass the current page and the matching total.

```tsx
import { useState } from 'react';
import { DataTable, type TableChange } from 'mantine-datatable-lite';

// The table sends the first request on mount, including column defaults.
const [request, setRequest] = useState<TableChange | null>(null);
const page = useEmployees(request); // your data hook: { rows, total, loading, error, retry }

<DataTable
  mode='server'
  rows={page.rows}
  columns={columns}
  pagination={{
    currentPage: request?.pagination?.currentPage ?? 1,
    pageSize: request?.pagination?.pageSize ?? 20,
    totalItems: page.total,
  }}
  onChange={setRequest}
  loading={page.loading}
  error={page.error}
  onRetry={page.retry}
/>;
```

`TableChange` contains `pagination?` (`currentPage`, `pageSize`), `sorter?`
(`field`, `order`), `filters` (`field`, `value`), `columnSearch` (`field`,
`value`), and `searchQuery`. `onChange` fires immediately for every change
except global search typing, which waits `debounceTime` (300 ms by default). In
server mode it also fires once on mount. Sorting, filtering, and searching reset
the page to 1. The default page size choices are `[10, 20, 50, 100]`; set
`pagination.pageSizeOptions` to `false` to hide the size picker.

The table does not fetch data. Handle request cancellation and stale responses
in your application. See the
[server example](https://github.com/ShaileshDhokare/mantine-datatable-lite/blob/master/apps/playground/src/pages/ServerPage.tsx).

For TypeScript 6 with `skipLibCheck: false`, the Mantine peer declarations also
need current library definitions (for example `lib: ["ESNext", "DOM"]`) and a
CSS module declaration such as `declare module '*.css';` (Vite supplies this
through `vite/client`).

## Columns and filters

Every column requires a unique `dataIndex` and a `header`. `dataIndex` reads a
direct row property; dotted paths are not resolved. For nested or computed
values, set `getValue(row)`: sorting, filtering, searching, filter choices, and
the default cell all use it. Use `render(row, index)` for custom cells.

```tsx
{ dataIndex: 'city', header: 'City', filterable: true, getValue: (row) => row.address.city }
```

Sorting, filtering, column search, and menus are opt in through `sortable`,
`filterable`, `searchable`, and `showMenu`. Header buttons are configured
through `showSortIcon`, `showFilterIcon`, and `showSearchIcon`. They default to
true, or to false when `showMenu` is on, since the menu has the same actions.
Global search checks all columns except those marked `searchable: false`.

| Column option | Purpose |
| --- | --- |
| `type` | `'string'`, `'number'`, `'boolean'`, or `'date'` |
| `getValue` | Value for sorting, filtering, searching, and the default cell |
| `defaultSortOrder`, `sortFn` | Initial ordering or a custom comparator |
| `defaultFilterValue`, `filterFn`, `renderFilter` | Initial/custom filtering |
| `filterOptions`, `searchableFilter` | Explicit choices and choice search |
| `defaultSearchValue` | Initial column search |
| `width`, `align` | Cell width and text alignment |
| `pinned`, `pinnable` | Initial left/right pin and menu pin actions |
| `menuOptions` | Limit the menu to sort/filter/search/pin/display actions |
| `hideable` | Allow hiding the column |

Filter value shapes match the public types:

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
search, and hidden columns, and returns pins to each column's `pinned` default.
Persisted layout contains only hidden/pinned IDs.

In client mode, string filter choices are derived from the rows and shown as-is.
In server mode, supply complete string `filterOptions`; boolean filters always
offer true and false.

### Date filters

Date filters use the browser's native date input by default. To use Mantine's
date picker, install `@mantine/dates` and `dayjs`, import
`@mantine/dates/styles.css` before the table stylesheet, and pass the component:

```tsx
import { DatePickerInput } from '@mantine/dates';

<DataTable rows={rows} columns={columns} dateInput={DatePickerInput} />;
```

Any component that accepts `DateInputProps` (`value`/`onChange` as
`YYYY-MM-DD` strings) works.

## Selection, expansion, and row actions

Use a unique, stable string or finite numeric `row.id`, or specify `idAccessor`.
Missing/duplicate IDs disable selection and expansion for affected rows, with a
development warning. IDs must remain unique across server pages.

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
      selection={{
        selectedIds,
        onChange: ({ ids }) => setSelectedIds(ids),
        renderBulkActions: ({ ids, clear }) => (
          <Button onClick={clear}>Clear {ids.length} selected</Button>
        ),
      }}
      expandable={{ render: (row) => <div>Age: {row.age}</div> }}
    />
  );
}
```

`selectedIds` is optional: omit it and the table keeps the selection itself
while still calling `onChange`. Selection can accumulate IDs across pages.
`loadedRows` in the selection snapshot contains selected rows available in the
supplied data; it does not fetch missing rows. Filter and search changes reset
selection. With `renderBulkActions`, a bulk action bar replaces the toolbar
while at least one row is selected.

Expansion supports `expandedIds`, `onChange`, `allowMultiple`, and
`trigger: 'icon' | 'row'`. Rows with `onRowClick` or row-triggered expansion are
focusable and respond to Enter and Space. Row-action cells prevent action clicks
from invoking the row click handler or row-triggered expansion.

## Labels

Replace any built-in text, for example for translations. Unlisted labels keep
their defaults.

```tsx
<DataTable
  rows={rows}
  columns={columns}
  labels={{
    noRecords: 'Keine Einträge',
    apply: 'Anwenden',
    selectedCount: (count) => `${count} ausgewählt`,
    pageRange: ({ from, to, total }) => `${from}–${to} von ${total}`,
  }}
/>
```

See `DataTableLabels` for every key.

## Public exports

Import from the package root. ESM and CommonJS builds include matching TypeScript
declarations. Import CSS through `mantine-datatable-lite/styles.css`.

| Export | Use |
| --- | --- |
| `DataTable` | Generic React table component |
| `Icon` | Inline SVG component with `name`, `size`, and standard SVG props |
| `rowActionsColumn` | Typed action-column factory |
| `DataTableProps`, `DataTableColumn`, `ColumnType` | Table/column definitions |
| `DataTableLabels`, `DateInputProps` | UI text and custom date input contracts |
| `IconProps`, `IconName`, `MenuOption` | Icon and menu definitions |
| `Sorter`, `SortOrder` | Sort request |
| `Filter`, `FilterValue`, `FilterOption`, `FilterRenderContext` | Filter definitions |
| `StringFilterValue`, `BooleanFilterValue`, `NumericFilterValue`, `DateFilterValue`, `NumericOperator` | Typed filter values |
| `ColumnSearch`, `TableChange` | Search and complete change request |
| `Pagination`, `PaginationChange` | Pagination config and requested page |
| `RowId`, `IdAccessor` | Row identity |
| `SelectionConfig`, `SelectionSnapshot`, `ExpandableConfig` | Selection and expansion definitions |

Internal hooks, context, header/footer components, and utilities are not public
exports. There is no public headless `useDataTable` hook.

## Upgrading from earlier alphas

| Before | Now |
| --- | --- |
| `pagination` meant the caller owns all data operations | Add `mode="server"` for that; without it, `pagination` pages rows in the browser |
| `pagination.defaultPageSize`, `from`, `to` | Removed; use `pageSize` |
| `PaginationChange` with `totalItems`, `from`, `to` | `{ currentPage, pageSize }` |
| `sorter: { sortField, sortOrder }` | `sorter: { field, order }` |
| `columnSearch: [{ searchField, searchValue }]` | `columnSearch: [{ field, value }]` |
| Column `sticky` | `pinned` |
| `toolbar`, `toolbarActions` | `selection.renderBulkActions` |
| `expandable={true}` with `expandedRowRender` | `expandable={{ render }}` |
| `SelectionSnapshot.kind`, `count`, `query` | Removed; use `ids` and `ids.length` |
| `PinnedColumns` type | Removed from the public exports |
| `@mantine/dates` peer dependency | Optional; pass `dateInput={DatePickerInput}` |

Behavior changes:

- Sort, filter, column search, and page changes call `onChange` immediately;
  `debounceTime` only applies to global search typing.
- Server mode calls `onChange` once on mount with the initial request.
- With `showMenu`, header sort/filter/search buttons are hidden unless you set
  `showSortIcon`, `showFilterIcon`, or `showSearchIcon`.
- The bulk action bar appears from the first selected row.
- Reset keeps each column's `pinned` default.
- Derived filter choices show raw values instead of sentence-cased labels.

## Scope

This release does not provide virtualization, cell editing, tree/grouped data,
multi-column sorting, column resizing, row drag and drop, built-in CSV/Excel
export, or one-click selection of every matching server row. Large data sets
should use server mode.

Custom Styles API slots are not part of the current table API. Configure the
exposed Mantine styling props and your Mantine theme.

## Examples and feedback

Read the [documentation](https://shaileshdhokare.github.io/mantine-datatable-lite/#/getting-started)
and [download the Markdown guide for AI coding tools](https://shaileshdhokare.github.io/mantine-datatable-lite/llm.md).

The [playground source](https://github.com/ShaileshDhokare/mantine-datatable-lite/tree/master/apps/playground)
contains basic, sorting, filtering, search, pagination, server, pinning, expansion,
selection, and combined examples.

Report issues through
[GitHub issues](https://github.com/ShaileshDhokare/mantine-datatable-lite/issues),
including the package, React, and Mantine versions and a small reproduction.

## License

MIT. Inline SVG attribution and licenses are included in `THIRD_PARTY_NOTICES`.
