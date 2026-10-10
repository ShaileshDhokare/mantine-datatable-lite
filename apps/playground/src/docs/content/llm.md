# Mantine DataTable Lite: guide for AI coding tools

This guide describes `mantine-datatable-lite@{{version}}`. Download it and attach it to an AI coding assistant, or give the assistant its direct URL. Check the installed package version before generating code: this is an alpha API and later releases may differ.

## Package and compatibility

- npm package: `mantine-datatable-lite`.
- Documented version: `{{version}}`; npm release tag: `alpha`.
- Documentation: https://shaileshdhokare.github.io/mantine-datatable-lite/#/getting-started
- This guide: https://shaileshdhokare.github.io/mantine-datatable-lite/llm.md
- API page: https://shaileshdhokare.github.io/mantine-datatable-lite/#/api
- Source and issues: https://github.com/ShaileshDhokare/mantine-datatable-lite
- License: MIT.
- Peer dependencies: React and React DOM `^19.3.0`; Mantine Core, Hooks and Dates `^9.6.0`. Keep React/React DOM versions matched and all Mantine versions matched.
- Mantine Dates is required even if date filters are disabled because the package imports its filter controls.
- No additional runtime dependencies beyond the React and Mantine peers. ESM, CommonJS and TypeScript declarations are supplied.

Public runtime exports are `DataTable`, `Icon` and `rowActionsColumn`. Import types from the package root. Import the stylesheet from `mantine-datatable-lite/styles.css`. Do not import internal hooks, context, components or source paths.

## Installation and styles

In an existing compatible React/Mantine app:

```bash
npm install --save-exact mantine-datatable-lite@{{version}}
```

In a new React app, also install the peers:

```bash
npm install react@^19.3.0 react-dom@^19.3.0 @mantine/core@^9.6.0 @mantine/hooks@^9.6.0 @mantine/dates@^9.6.0
```

TypeScript projects need matching React type declarations. The `alpha` tag can move; an exact version makes generated code reproducible.

Import CSS once in the application entry point, in this order. Put the app inside `MantineProvider`:

```tsx
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-datatable-lite/styles.css';
import { MantineProvider } from '@mantine/core';
import { App } from './App';

export function Root() {
  return <MantineProvider><App /></MantineProvider>;
}
```

If the app already has a provider, reuse it. In TypeScript configurations that check dependency declarations, use current library definitions such as `lib: ["ESNext", "DOM"]` and CSS module declarations; Vite provides CSS declarations through `vite/client`.

## Local table and columns

`rows` and `columns` are required. Define columns as `DataTableColumn<Row>[]` to check callbacks against the row type. The table can also infer its generic from `rows`.

```tsx
import { DataTable, type DataTableColumn } from 'mantine-datatable-lite';

export type Person = {
  id: number;
  name: string;
  department: string;
  salary: number;
  active: boolean;
  joined: Date;
};

export const rows: Person[] = [
  { id: 1, name: 'Alice', department: 'Engineering', salary: 90000, active: true, joined: new Date('2026-01-15') },
  { id: 2, name: 'Bob', department: 'Design', salary: 80000, active: false, joined: new Date('2026-02-01') },
];

export const columns: DataTableColumn<Person>[] = [
  { dataIndex: 'name', header: 'Name', sortable: true, searchable: true, showMenu: true },
  { dataIndex: 'department', header: 'Department', filterable: true, showMenu: true },
  { dataIndex: 'salary', header: 'Salary', type: 'number', sortable: true, filterable: true,
    align: 'right', render: (row) => `$${row.salary.toLocaleString()}` },
  { dataIndex: 'active', header: 'Active', type: 'boolean', filterable: true,
    render: (row) => row.active ? 'Yes' : 'No' },
  { dataIndex: 'joined', header: 'Joined', type: 'date', sortable: true, filterable: true,
    render: (row) => row.joined.toLocaleDateString() },
];

export function App() {
  return <DataTable rows={rows} columns={columns} globalSearch columnSelector
    showTableStatePills showReset withTableBorder highlightOnHover />;
}
```

Each `dataIndex` must be unique and stable. It reads a direct row property; dotted paths are not resolved. Use `render(row, index)` for nested or computed content. Supply an appropriate direct property or custom comparator/filter for data operations on such columns. Display indices are not stable record IDs.

Specify `type: 'number' | 'boolean' | 'date'` for typed behavior; the default is `'string'`. Keep dates as `Date` instances when using date filters. Convert JSON date strings at the API boundary.

## Data ownership and change requests

Without `pagination`, the table filters, searches and then sorts the supplied rows locally. It does not provide automatic local pagination.

Providing `pagination` makes all row processing caller-owned: the table renders the rows exactly as supplied. The caller must apply filters, search and sorting to the complete data set, determine the matching total and then slice or fetch the requested page. This rule also applies to pagination of an in-memory array.

`onChange(request: TableChange)` reports:

- `pagination?`: `currentPage`, `pageSize`, `totalItems`, `from`, `to`.
- `sorter?`: `{ sortField, sortOrder: 'asc' | 'desc' }`.
- `filters`: `{ field, value }[]`.
- `columnSearch`: `{ searchField, searchValue }[]`.
- `searchQuery`: the global search string.

Sorting, filtering and searching reset the current page to 1. Data-change notifications are debounced; `debounceTime` defaults to 300 ms. The package does not fetch data or own network loading/error state. Initiate the first request in the consuming app.

Pagination is 1-based. Provide the total number of matching records, not the number of rows on the current page. Default size choices are `[10, 20, 50, 100]`; set `pageSizeOptions: false` to hide the selector. A nonpositive size falls back to `defaultPageSize` or 10.

## Sorting, filters and search

Sorting is single-column and opt-in using `sortable: true`. Use `defaultSortOrder` for the initial order and `sortFn(a, b)` for an ascending comparator; descending reverses its result. `showSortIcon` controls the indicator when sorting is enabled.

Filtering is opt-in using `filterable: true`. Applied filters are combined with AND. Use these value shapes for `defaultFilterValue` and requests:

```tsx
import type { FilterValue } from 'mantine-datatable-lite';

const departments: FilterValue = ['Engineering', 'Design'];
const active: FilterValue = [true];
const minimumSalary: FilterValue = { operator: 'gte', value: 80000 };
const salaryRange: FilterValue = { operator: 'between', value: [80000, 120000] };
const joinedAfter: FilterValue = { operator: 'gte', value: new Date('2026-01-01') };
```

Numeric and date operators are `eq`, `neq`, `gt`, `gte`, `lt`, `lte` and `between`. A range requires exactly two bounds. String/boolean filters select values within a column; numeric/date filters compare typed values.

`filterOptions` accepts strings or `{ value: string, label: string }` objects. For boolean choices use string values such as `'true'` and `'false'`; the applied filter uses booleans. In caller-owned pagination, supply all string/boolean choices explicitly because the current page cannot describe all available choices. `searchableFilter` adds search inside the choices; `showFilterIcon` controls the trigger.

`filterFn(row, filterValue)` overrides local filtering. `renderFilter(context)` supplies custom draft controls with `value`, `onChange`, `apply` and `reset`. Updating the draft does not apply it; call `apply()` to commit it. Built-in filter and column-search controls also use Apply/Reset.

Enable a column search with `searchable: true`. `showSearchIcon` adds a dedicated trigger and `defaultSearchValue` sets its initial term. Multiple column search terms are combined with AND. `globalSearch` enables the toolbar search and matches across all columns except those explicitly marked `searchable: false`.

Search compares raw field values, not JSX returned by `render`. Only default-rendered cells automatically highlight matching text. Hidden columns keep their active filters/searches.

## Caller-owned pagination and remote data

This complete consumer component accepts an application-specific `loadPage` function. Its contract is `{ rows: Person[], totalItems: number }`. Implement that function using your backend; forward the request fields using the query/body contract your API expects and parse dates into `Date` values. `columns` and `Person` below refer to the local example saved as `App.tsx`.

```tsx
import { useEffect, useState } from 'react';
import { DataTable, type TableChange } from 'mantine-datatable-lite';
import { columns, type Person } from './App';

type Page = { rows: Person[]; totalItems: number };
type LoadPage = (request: TableChange, signal: AbortSignal) => Promise<Page>;

export function RemoteTable({ loadPage }: { loadPage: LoadPage }) {
  const [request, setRequest] = useState<TableChange>({
    pagination: { currentPage: 1, pageSize: 10, totalItems: 0 },
    filters: [], columnSearch: [], searchQuery: '',
  });
  const [page, setPage] = useState<Page>({ rows: [], totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(undefined);
    loadPage(request, controller.signal)
      .then((result) => { if (!controller.signal.aborted) setPage(result); })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Could not load records');
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [request, retryVersion, loadPage]);

  const remoteColumns = columns.map((column) => {
    if (column.dataIndex === 'department') {
      return { ...column, filterOptions: ['Engineering', 'Design'] };
    }
    if (column.dataIndex === 'active') {
      return { ...column, filterOptions: [
        { value: 'true', label: 'Yes' }, { value: 'false', label: 'No' },
      ] };
    }
    return column;
  });

  return <DataTable rows={page.rows} columns={remoteColumns} globalSearch
    pagination={{ currentPage: request.pagination?.currentPage ?? 1,
      pageSize: request.pagination?.pageSize ?? 10, totalItems: page.totalItems }}
    onChange={setRequest} loading={loading} error={error}
    onRetry={() => setRetryVersion((version) => version + 1)} />;
}
```

Keep `loadPage` stable across renders (a module-level function or memoized callback). Aborting and checking the signal prevents obsolete responses from overwriting newer results. Preserve the last successful rows during loading/error. Use `loaderProps` to customize the Mantine loader, and `emptyState` for an empty result.

The documentation server demo fetches a static `employees.json` on every request and applies the request locally; GitHub Pages does not implement a backend. Do not copy that static URL as a production API.

## Selection, expansion and actions

Selection and expansion require a unique stable string or finite numeric ID. `row.id` is the default. Set `idAccessor` to a suitable field or `(row) => stableId` when needed. IDs must be unique across all server pages. Missing/duplicate IDs disable selection/expansion for affected rows; array indices are unsuitable IDs for reordered or paged records.

Selection is controlled through `selectedIds` and `onChange(snapshot)`. The checkbox in the header selects eligible visible rows and has a mixed state when only some are selected. `isSelectable(row)` limits eligibility; `showSelectionCount` controls the count.

Snapshots contain `kind: 'include'`, `ids`, `loadedRows`, `count`, and the current filter/search `query`. `loadedRows` contains only selected records available in the supplied rows. It does not fetch records from other pages. Use `ids` for server bulk operations. Selection resets on query changes.

Set `toolbar` to enable the replacement toolbar when more than one row is selected. `renderBulkActions` receives the snapshot plus `clear()`. `toolbarActions` accepts action icons (optionally wrapped in tooltips) and requires `toolbar`. Confirm destructive actions in the application.

This example reuses `Person` and `columns` from `App.tsx`:

```tsx
import { useState } from 'react';
import { ActionIcon, Button, Text, Tooltip } from '@mantine/core';
import { DataTable, Icon, rowActionsColumn, type RowId } from 'mantine-datatable-lite';
import { columns, type Person } from './App';

export function SelectedTable({ rows }: { rows: Person[] }) {
  const [selectedIds, setSelectedIds] = useState<RowId[]>([]);
  return <DataTable rows={rows} columns={[
    ...columns,
    rowActionsColumn<Person>({ render: (row) => (
      <Tooltip label={`View ${row.name}`}>
        <ActionIcon aria-label={`View ${row.name}`} onClick={() => alert(row.name)}>
          <Icon name='show' size={18} />
        </ActionIcon>
      </Tooltip>
    ) }),
  ]} toolbar selection={{ selectedIds, onChange: ({ ids }) => setSelectedIds(ids),
    renderBulkActions: ({ count, clear }) => <Button onClick={clear}>Clear {count} selected</Button>,
  }} expandable={{ render: (row) => <Text>{row.department}: {row.name}</Text>,
    allowMultiple: true, trigger: 'icon',
  }} />;
}
```

Expansion is local unless you supply `expandedIds` and `onChange`. Configure `render(row, index)`, `allowMultiple` (default false) and `trigger: 'icon' | 'row'` (default `'icon'`). For shorthand use `expandable={true}` with `expandedRowRender`.

`rowActionsColumn<Row>({ render, header?, width?, sticky? })` creates an action column with default heading Actions, width 80 and right pinning. Its sorting, filtering, search, hiding and pin-menu actions are disabled. Action clicks do not invoke `onRowClick` or row-triggered expansion. Label icon buttons for accessibility. `Icon` accepts a supported `IconName`, size, color, fill and standard SVG props; icon names are listed in the API reference below.

## Menus, pinning and persistence

- `showMenu` enables a column menu. `menuOptions` selects the available groups: `'sort'`, `'filter'`, `'search'`, `'pin'`, `'display'`.
- `sticky: 'left' | 'right'` sets an initial pinned position. Menu pin actions move a column to either side; move actions reorder pinned columns one position at a time. Use widths and `minWidth` to create useful horizontal scrolling.
- `pinnable: false` disables pin-menu actions; `hideable: false` prevents hiding through the menu or picker.
- `columnSelector` enables the column picker; changes are staged until Apply. Hiding affects presentation, not active filtering/search.
- `persistKey` stores hidden/pinned column IDs in `localStorage`. Use a distinct key for each table configuration. It does not persist data, queries, selection or expanded rows.
- `showTableStatePills` adds removable sort, filter and search pills. `maxChips` defaults to 5 and moves extra pills into overflow.
- `showReset` clears sort, filters, searches and column layout, showing all columns and unpinning them. It resets the page to 1.

These toolbar features are opt-in. A `PinnedColumns` type describes left/right ID arrays, but it is not a `DataTable` prop; do not invent a `pinnedColumns` prop.

## Appearance and row events

Use your Mantine theme and the public props:

- `withTableBorder` and `withColumnBorders` default false; `withRowBorders` defaults true.
- `striped` supports boolean, `'odd'` or `'even'`; `stripedColor` customizes its background.
- `highlightOnHover` and `highlightOnHoverColor` control hovered row backgrounds.
- `borderColor`, `horizontalSpacing`, `verticalSpacing` use Mantine colors/spacing. CSS color variables such as `var(--mantine-color-blue-light)` adapt to the color scheme.
- `layout: 'auto' | 'fixed'` controls CSS table layout.
- `minWidth` creates a horizontal scroll container; `maxHeight` bounds its height. Use `stickyHeader` with `maxHeight` to keep headings visible.
- Column `width` accepts a number or CSS length; `align` accepts `'left' | 'center' | 'right'`.
- `onRowClick(row, index, event)` handles row clicks. Action, selection and expansion controls are excluded.
- `rowProps(row, index)` adds standard `<tr>` attributes/styles. Use `render` for custom cell content.

There are no public DataTable `classNames`, `styles` or `vars` slots in this release. Reuse Mantine components, theme tokens and the supported appearance props.

## Rules for code generation

1. Verify the installed package and peer versions, and use the API definitions below for this documented version.
2. Import only public root exports and the documented stylesheet. Keep the existing Mantine provider and CSS order.
3. Decide who owns data operations before implementing pagination. Any `pagination` prop means the caller owns filtering/search/sorting and page slicing/fetching.
4. Preserve typed field values. Use `type: 'number'`, `'boolean'` or `'date'` where appropriate; convert JSON dates into `Date` instances.
5. Use unique column keys and stable record IDs. Never use page/display indices for selection or expansion identity.
6. Keep remote fetching, initial load, loading/error state, cancellation, retry and destructive-action confirmation in the consuming app.
7. Do not invent APIs from other table libraries. This release has no `manualSorting`, public `useDataTable`, virtualization, column resizing, editing, grouped/tree rows, multi-column sorting, row drag and drop, built-in CSV/Excel export or select-all-matching-server-records mode.

Suggested prompt: "Use the attached mantine-datatable-lite guide for version {{version}}. Build a typed Mantine table for my existing React app. Use only the documented public API. Explain whether the table or my application owns the data operations."

## Feature links

- Basic table: https://shaileshdhokare.github.io/mantine-datatable-lite/#/basic
- Sorting: https://shaileshdhokare.github.io/mantine-datatable-lite/#/sorting
- Filtering: https://shaileshdhokare.github.io/mantine-datatable-lite/#/filtering
- Search: https://shaileshdhokare.github.io/mantine-datatable-lite/#/searching
- Pagination: https://shaileshdhokare.github.io/mantine-datatable-lite/#/pagination
- Remote data: https://shaileshdhokare.github.io/mantine-datatable-lite/#/server
- Selection: https://shaileshdhokare.github.io/mantine-datatable-lite/#/selection
- Pinning and persistence: https://shaileshdhokare.github.io/mantine-datatable-lite/#/pinning
- Expansion: https://shaileshdhokare.github.io/mantine-datatable-lite/#/expandable
- Row actions: https://shaileshdhokare.github.io/mantine-datatable-lite/#/row-actions
- Toolbar and state pills: https://shaileshdhokare.github.io/mantine-datatable-lite/#/toolbar
- Theming: https://shaileshdhokare.github.io/mantine-datatable-lite/#/theming
- Combined example: https://shaileshdhokare.github.io/mantine-datatable-lite/#/advanced
