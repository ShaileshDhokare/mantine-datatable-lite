# mantine-datatable-lite

A small, typed data table for [Mantine](https://mantine.dev) 9 and React 19, with
the features real screens need and nothing more.

[![npm](https://img.shields.io/npm/v/mantine-datatable-lite/next?label=npm)](https://www.npmjs.com/package/mantine-datatable-lite)
[![license](https://img.shields.io/npm/l/mantine-datatable-lite)](https://github.com/ShaileshDhokare/mantine-datatable-lite/blob/master/packages/mantine-datatable-lite/LICENSE)
![types](https://img.shields.io/badge/types-included-blue)

**[Documentation and live demos](https://shaileshdhokare.github.io/mantine-datatable-lite/#/getting-started)**
· [API reference](https://shaileshdhokare.github.io/mantine-datatable-lite/#/api)
· [Full-stack example](https://github.com/ShaileshDhokare/mantine-datatable-lite/tree/master/examples/server-mode)

- **Sorting, filtering and search.** Typed sort, choice filters for strings and
  booleans, operator filters for numbers and dates, per-column and global search.
- **Client or server data.** The table can filter, sort and page your rows, or
  hand every change to your API in one request object.
- **Column tools.** A compact column menu, pinning to either side, a column
  picker, removable state pills, reset, and saved layouts.
- **Rows.** Selection with bulk actions, expandable detail panels, and an
  action column helper.
- **Mantine-native.** Built from Mantine components, follows your theme and dark
  mode, and accepts the familiar `Table` styling props.
- **Light.** About 17 KB gzipped (JS + CSS) and no runtime dependencies beyond
  React and Mantine.

> **Release candidate.** `1.0.0-rc.0` is the API planned for 1.0. It is published
> under the `next` tag; pin an exact version, and see
> [Upgrading from earlier alphas](#upgrading-from-earlier-alphas).

## Contents

- [Install](#install)
- [Quick start](#quick-start)
- [Client and server mode](#client-and-server-mode)
- [Columns](#columns)
- [Sorting, filtering and search](#sorting-filtering-and-search)
- [Pagination](#pagination)
- [Selection and bulk actions](#selection-and-bulk-actions)
- [Expandable rows and row actions](#expandable-rows-and-row-actions)
- [Toolbar, column menu and pinning](#toolbar-column-menu-and-pinning)
- [Styling](#styling)
- [Translations](#translations)
- [Accessibility](#accessibility)
- [TypeScript](#typescript)
- [Props](#props)
- [Upgrading from earlier alphas](#upgrading-from-earlier-alphas)

## Install

```sh
npm install mantine-datatable-lite@next
```

Peer dependencies:

| Package | Version |
| --- | --- |
| `react`, `react-dom` | `^19.2.0` |
| `@mantine/core`, `@mantine/hooks` | `^9.6.0` |

`@mantine/dates` is optional. See [Date filters](#date-filters).

Import the stylesheet once, after Mantine's:

```tsx
import '@mantine/core/styles.css';
import 'mantine-datatable-lite/styles.css';
```

## Quick start

```tsx
import { MantineProvider } from '@mantine/core';
import { DataTable, type DataTableColumn } from 'mantine-datatable-lite';

type Employee = {
  id: number;
  name: string;
  department: string;
  salary: number;
  active: boolean;
};

const columns: DataTableColumn<Employee>[] = [
  { dataIndex: 'name', header: 'Name', sortable: true, searchable: true },
  { dataIndex: 'department', header: 'Department', filterable: true },
  {
    dataIndex: 'salary',
    header: 'Salary',
    type: 'number',
    sortable: true,
    filterable: true,
    align: 'right',
    render: (row) => `$${row.salary.toLocaleString()}`,
  },
  { dataIndex: 'active', header: 'Active', type: 'boolean', filterable: true },
];

export function Employees({ rows }: { rows: Employee[] }) {
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

Everything is opt-in: start with `rows` and `columns`, then turn on the
features a screen needs. The bundle is marked `'use client'`, so it can be
imported from React Server Component frameworks such as the Next.js App Router.

## Client and server mode

`mode` decides who owns the data.

**Client mode** (the default) is for data already in the browser. The table
filters, searches, sorts and pages `rows` itself.

```tsx
<DataTable rows={employees} columns={columns} pagination={{ pageSize: 20 }} />
```

**Server mode** is for data that lives behind an API. The table renders `rows`
as they are and reports every change through `onChange` as one `TableChange`
object. It also reports the initial request once on mount, including column
defaults, so the first fetch needs no extra setup.

```tsx
import { useEffect, useState } from 'react';
import { DataTable, type TableChange } from 'mantine-datatable-lite';

export function RemoteEmployees() {
  const [request, setRequest] = useState<TableChange | null>(null);
  const [page, setPage] = useState({ rows: [] as Employee[], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!request) return;
    const controller = new AbortController();
    setLoading(true);
    fetch('/api/employees/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((result) => setPage(result))
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [request]);

  return (
    <DataTable
      mode='server'
      rows={page.rows}
      columns={columns}
      pagination={{
        currentPage: request?.pagination?.currentPage ?? 1,
        pageSize: request?.pagination?.pageSize ?? 10,
        totalItems: page.total,
      }}
      onChange={setRequest}
      loading={loading}
    />
  );
}
```

A `TableChange` looks like this:

```ts
{
  pagination: { currentPage: 2, pageSize: 20 },
  sorter: { field: 'salary', order: 'desc' },
  filters: [
    { field: 'department', value: ['Engineering', 'Design'] },
    { field: 'salary', value: { operator: 'between', value: [50000, 90000] } },
  ],
  columnSearch: [{ field: 'name', value: 'ali' }],
  searchQuery: 'london',
}
```

`onChange` fires immediately for every change except typing in the global
search, which waits `debounceTime` (300 ms by default). Sorting, filtering and
searching return to page 1. `loading` shows an overlay over the current rows.
`error` replaces the rows with an error icon and message (pass `true` for the
default `loadError` text), and `onRetry` adds a Retry button under it.

The repository has a complete
[React + Express + SQLite example](https://github.com/ShaileshDhokare/mantine-datatable-lite/tree/master/examples/server-mode)
that turns a `TableChange` into SQL.

## Columns

Each column needs a unique `dataIndex` and a `header`. `dataIndex` names the row
property to read. For computed or nested values, add `getValue`: sorting,
filtering, searching, filter choices and the default cell all use it.

```tsx
const columns: DataTableColumn<Employee>[] = [
  { dataIndex: 'name', header: 'Name' },
  {
    dataIndex: 'city',
    header: 'City',
    filterable: true,
    getValue: (row) => row.address.city,
  },
  {
    dataIndex: 'joined',
    header: 'Joined',
    type: 'date',
    sortable: true,
    render: (row) => row.joined.toLocaleDateString(),
  },
];
```

`type` (`'string'`, `'number'`, `'boolean'` or `'date'`) picks the sort
comparison and the filter UI. Keep dates as `Date` objects. `render` customizes
the cell without changing what sorting and filtering compare.

## Sorting, filtering and search

| Column option | What it does |
| --- | --- |
| `sortable` | Sort by this column. Clicking cycles ascending, descending, off. |
| `defaultSortOrder` | Start sorted. |
| `sortFn(a, b)` | Custom ascending comparator. |
| `filterable` | Add a filter: choices for strings and booleans, operators for numbers and dates. |
| `filterOptions` | Supply choices (`string[]` or `{ value, label }[]`). Needed for strings in server mode. |
| `searchableFilter` | Add a search box above long choice lists. |
| `defaultFilterValue` | Start filtered. |
| `filterFn(row, value)` | Custom predicate (client mode). |
| `renderFilter(context)` | Your own filter UI with `value`, `onChange`, `apply` and `reset`. |
| `searchable` | `true` adds a column search. `false` leaves the column out of global search. |
| `defaultSearchValue` | Start with a column search applied. |

Number and date operators are `eq`, `neq`, `gt`, `gte`, `lt`, `lte` and
`between`. Filters on different columns combine with AND. Filter and search
drafts apply when the user presses **Apply**.

Turn on the toolbar search with `globalSearch`. Matching text is highlighted in
default cells.

### Date filters

Date filters use the browser's native date input, so `@mantine/dates` is not
required. To use Mantine's date picker instead, install it and pass the
component:

```sh
npm install @mantine/dates dayjs
```

```tsx
import '@mantine/dates/styles.css';
import { DatePickerInput } from '@mantine/dates';

<DataTable rows={rows} columns={columns} dateInput={DatePickerInput} />;
```

Any component that accepts `DateInputProps` (`value` and `onChange` as
`YYYY-MM-DD` strings) works.

## Pagination

| `pagination` field | Client mode | Server mode |
| --- | --- | --- |
| `currentPage` | Starting page | Current page (controlled) |
| `pageSize` | Starting page size | Page size (controlled) |
| `totalItems` | Counted by the table | Total matching rows (required) |
| `pageSizeOptions` | Size choices, or `false` to hide the picker | Same |

`pagination` also accepts `true` for the defaults: page size 10 and choices of
10, 20, 50 and 100.

## Selection and bulk actions

```tsx
<DataTable
  rows={rows}
  columns={columns}
  selection={{
    isSelectable: (row) => row.active,
    renderBulkActions: ({ ids, loadedRows, clear }) => (
      <Button onClick={() => archive(ids).then(clear)}>
        Archive {ids.length}
      </Button>
    ),
  }}
/>
```

Rows need a unique, stable ID: `row.id` by default, or set `idAccessor` to a key
or a function. Pass `selectedIds` and `onChange` to control the selection
yourself, or leave them out and the table keeps it. While rows are selected,
`renderBulkActions` replaces the toolbar with a bulk action bar. Selection
survives sorting and paging, and clears when filters or search change.
`loadedRows` holds the selected rows present in the current `rows`; use `ids`
for actions across server pages.

## Expandable rows and row actions

```tsx
import { DataTable, rowActionsColumn } from 'mantine-datatable-lite';

<DataTable
  rows={rows}
  columns={[
    ...columns,
    rowActionsColumn<Employee>({
      render: (row) => (
        <ActionIcon aria-label={`Edit ${row.name}`} onClick={() => edit(row)}>
          <IconPencil size={16} />
        </ActionIcon>
      ),
    }),
  ]}
  expandable={{
    render: (row) => <EmployeeDetails employee={row} />,
    allowMultiple: true,
  }}
  onRowClick={(row) => open(row)}
/>;
```

`expandable` takes `render`, `allowMultiple`, `trigger: 'icon' | 'row'`, and
optional `expandedIds` with `onChange` for controlled expansion.
`rowActionsColumn` adds a column pinned to the right whose clicks never trigger
`onRowClick` or row expansion. Clickable rows can be focused and activated with
Enter or Space.

## Toolbar, column menu and pinning

| Prop | What it adds |
| --- | --- |
| `globalSearch` | An expanding search box across all columns. |
| `columnSelector` | A picker to show and hide columns. |
| `showTableStatePills` | Removable pills for the active sort, filters, searches and hidden columns. `maxChips` limits how many show. |
| `showReset` | A button that clears sorting, filters, searches and layout changes. |

Column options:

- `showMenu` adds a compact menu with sort, filter, search, pin and hide
  actions; `menuOptions` limits and orders them. With a menu, the separate header
  buttons are hidden unless you set `showSortIcon`, `showFilterIcon` or
  `showSearchIcon`.
- `pinned: 'left' | 'right'` pins a column from the start. Users can pin, unpin
  and reorder pinned columns from the menu; `pinnable: false` turns that off.
- `hideable: false` keeps a column visible.

`persistKey` saves hidden and pinned columns to `localStorage`. Pair pinning
with `minWidth` so the table scrolls horizontally, and with `maxHeight` plus
`stickyHeader` for a scrolling body with fixed headings.

## Styling

The table is a Mantine `Table` and accepts its styling props: `striped`,
`stripedColor`, `highlightOnHover`, `highlightOnHoverColor`, `withTableBorder`,
`withColumnBorders`, `withRowBorders`, `borderColor`, `horizontalSpacing`,
`verticalSpacing`, `stickyHeader` and `layout`. Colors and spacing follow your
Mantine theme, including dark mode. Use `render` for custom cells, `rowProps`
for row attributes and styles, and `emptyState` for the no-results message.

## Translations

`labels` replaces any built-in text. Labels you leave out keep their English
defaults.

```tsx
<DataTable
  rows={rows}
  columns={columns}
  labels={{
    noRecords: 'Keine Einträge',
    apply: 'Anwenden',
    reset: 'Zurücksetzen',
    selectedCount: (count) => `${count} ausgewählt`,
    pageRange: ({ from, to, total }) => `${from}–${to} von ${total}`,
  }}
/>
```

See the `DataTableLabels` type for every key. It covers visible text, screen
reader labels (for example `sortColumn`, `columnMenu`, `removePill` and
`pageControl`) and `formatDate`, which formats dates in filter pills. Labels that
include a column or a count are functions, so word order can follow the
language:

```tsx
labels={{
  sortColumn: (column, order) =>
    `${column} sortieren (${order === 'asc' ? 'aufsteigend' : order === 'desc' ? 'absteigend' : 'unsortiert'})`,
  columnMenu: (column) => `Menü für ${column}`,
  removePill: (pill) => `${pill} entfernen`,
  formatDate: (date) => date.toLocaleDateString('de-DE'),
}}
```

Right-to-left layouts work with Mantine's `DirectionProvider`. Pinning uses
logical sides: `pinned: 'left'` is the start side, which is on the right in a
right-to-left layout, so translate `pinLeft`, `pinRight`, `moveLeft` and
`moveRight` as start and end.

## Accessibility

- Sortable headers set `aria-sort`, and every icon button has a translatable
  label. Menus, popovers and the page-size select come from Mantine and support
  the keyboard.
- Name the table with `aria-label`, or point `aria-labelledby` at a visible
  heading.
- Clickable rows (`onRowClick` or `expandable.trigger: 'row'`) are focusable,
  show a focus ring, and open with Enter or Space. Expand buttons set
  `aria-expanded` and `aria-controls`.
- A status region announces the selected count, including the first selection.
  While the bulk action bar is shown, the toolbar under it is inert and hidden
  from screen readers, and focus moves between them.
- `aria-busy` marks the table while `loading` is set, and `error` renders as an
  alert.
- Colors come from your Mantine theme. Mantine's default `dimmed` text and
  light-mode primary color are below the WCAG AA contrast ratio for small text;
  raise them in your theme if you need AA (the
  [server-mode example](https://github.com/ShaileshDhokare/mantine-datatable-lite/tree/master/examples/server-mode)
  shows one way).

## TypeScript

The table is generic over the row type, which it infers from `rows`. Callbacks
such as `render`, `getValue`, `sortFn`, `onRowClick` and `renderBulkActions`
receive typed rows, `idAccessor` only accepts keys that hold strings or numbers,
and filter values are typed by shape (`between` needs two bounds). All public
types are exported from the package root.

## Props

### `DataTable`

| Prop | Type | Default |
| --- | --- | --- |
| `rows` | `T[]` | required |
| `columns` | `DataTableColumn<T>[]` | required |
| `mode` | `'client' \| 'server'` | `'client'` |
| `pagination` | `Pagination \| boolean` | off |
| `onChange` | `(change: TableChange) => void` | |
| `idAccessor` | row key or `(row) => string \| number` | `row.id` |
| `selection` | `SelectionConfig<T>` | off |
| `expandable` | `ExpandableConfig<T>` | off |
| `onRowClick` | `(row, index, event) => void` | |
| `rowProps` | `(row, index) => ComponentProps<'tr'>` | |
| `globalSearch` | `boolean` | `false` |
| `debounceTime` | `number` (ms) | `300` |
| `columnSelector` | `boolean` | `false` |
| `showTableStatePills` | `boolean` | `false` |
| `maxChips` | `number` | `5` |
| `showReset` | `boolean` | `false` |
| `persistKey` | `string` | |
| `minWidth`, `maxHeight` | CSS length | |
| `loading` | `boolean` | `false` |
| `loaderProps` | Mantine `LoaderProps` | |
| `error` | `ReactNode`, or `true` for the default message | |
| `onRetry` | `() => void` | |
| `emptyState` | `ReactNode` | "No records found" |
| `labels` | `Partial<DataTableLabels>` | English |
| `aria-label`, `aria-labelledby` | `string` | |
| `dateInput` | `ComponentType<DateInputProps>` | native date input |

Plus the Mantine `Table` styling props listed under [Styling](#styling).

### Column

| Option | Type |
| --- | --- |
| `dataIndex` | row key or a unique string |
| `header` | `ReactNode` |
| `type` | `'string' \| 'number' \| 'boolean' \| 'date'` |
| `getValue` | `(row) => unknown` |
| `render` | `(row, index) => ReactNode` |
| `align`, `width` | text alignment, CSS length or number |
| `sortable`, `defaultSortOrder`, `sortFn`, `showSortIcon` | sorting |
| `filterable`, `defaultFilterValue`, `filterOptions`, `searchableFilter`, `filterFn`, `renderFilter`, `showFilterIcon` | filtering |
| `searchable`, `defaultSearchValue`, `showSearchIcon` | search |
| `showMenu`, `menuOptions` | column menu |
| `pinned`, `pinnable`, `hideable` | layout |
| `stopRowClick` | keep cell clicks from reaching `onRowClick` |

Full descriptions are in the
[API reference](https://shaileshdhokare.github.io/mantine-datatable-lite/#/api).

## Upgrading from earlier alphas

| Before | Now |
| --- | --- |
| `pagination` meant the caller owns all data | Add `mode="server"` for that; without it, `pagination` pages rows in the browser |
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

- Sort, filter, column search and page changes call `onChange` immediately;
  `debounceTime` only applies to typing in the global search.
- Server mode calls `onChange` once on mount with the initial request.
- With `showMenu`, the header sort, filter and search buttons are hidden unless
  you turn them on.
- The bulk action bar appears from the first selected row.
- Reset keeps each column's `pinned` default.
- Derived filter choices show raw values instead of sentence-cased labels.
- The table uses separate borders (`border-collapse: separate`), and a scrolling
  table draws its outer border on the scroll frame, so pinned columns keep their
  borders while scrolling.
- The table renders one root element, so a parent `Stack` or flex `gap` no
  longer adds space between the toolbar, the table and the pagination.
- The bulk action bar covers the toolbar at exactly the same size, and both keep
  the same height when the global search opens.
- `error` replaces the rows inside the table, with an icon and a Retry button
  under the message, instead of an alert under the table. `error={true}` shows
  the new `loadError` label.
- The expand column header has screen-reader text instead of an `aria-label`,
  and the selected count is announced through a status region.

## Not included

Virtualization, cell editing, grouped or tree rows, multi-column sorting, column
resizing, drag and drop, and CSV/Excel export are out of scope. For large data
sets, use server mode.

## License

MIT. Icon paths are from [Lucide](https://lucide.dev) (ISC); see
`THIRD_PARTY_NOTICES`.
