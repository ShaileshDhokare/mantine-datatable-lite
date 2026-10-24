# Mantine DataTable Lite: guide for AI coding tools

This guide describes `mantine-datatable-lite@0.1.0-alpha.2`. Download it and attach it to an AI coding assistant, or give the assistant its direct URL. Check the installed package version before generating code: this is an alpha API and later releases may differ.

## Package and compatibility

- npm package: `mantine-datatable-lite`.
- Documented version: `0.1.0-alpha.2`; npm release tag: `alpha`.
- Documentation: https://shaileshdhokare.github.io/mantine-datatable-lite/#/getting-started
- This guide: https://shaileshdhokare.github.io/mantine-datatable-lite/llm.md
- API page: https://shaileshdhokare.github.io/mantine-datatable-lite/#/api
- Source and issues: https://github.com/ShaileshDhokare/mantine-datatable-lite
- License: MIT.
- Peer dependencies: React and React DOM `^19.2.0`; Mantine Core and Hooks `^9.6.0`. Keep React/React DOM versions matched and all Mantine versions matched.
- `@mantine/dates` is optional. Date filters use the browser's native date input unless you pass Mantine's `DatePickerInput` (or `DateInput`) as `dateInput`.
- No additional runtime dependencies beyond the React and Mantine peers. ESM, CommonJS and TypeScript declarations are supplied.

Public runtime exports are `DataTable`, `Icon` and `rowActionsColumn`. Import types from the package root. Import the stylesheet from `mantine-datatable-lite/styles.css`. Do not import internal hooks, context, components or source paths.

## Installation and styles

In an existing compatible React/Mantine app:

```bash
npm install --save-exact mantine-datatable-lite@0.1.0-alpha.2
```

In a new React app, also install the peers:

```bash
npm install react@^19.2.0 react-dom@^19.2.0 @mantine/core@^9.6.0 @mantine/hooks@^9.6.0
```

TypeScript projects need matching React type declarations. The `alpha` tag can move; an exact version makes generated code reproducible.

Import CSS once in the application entry point, in this order. Put the app inside `MantineProvider`:

```tsx
import '@mantine/core/styles.css';
import 'mantine-datatable-lite/styles.css';
import { MantineProvider } from '@mantine/core';
import { App } from './App';

export function Root() {
  return <MantineProvider><App /></MantineProvider>;
}
```

For Mantine's date picker in date filters, also install `@mantine/dates` and `dayjs`, import `@mantine/dates/styles.css` before the table stylesheet, and pass `dateInput={DatePickerInput}`.

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

Each `dataIndex` must be unique and stable. By default it reads a direct row property; dotted paths are not resolved. For nested or computed values, set `getValue(row)`: sorting, filtering, searching, filter choices and the default cell all use it. Use `render(row, index)` for custom cell content. Display indices are not stable record IDs.

Specify `type: 'number' | 'boolean' | 'date'` for typed behavior; the default is `'string'`. Keep dates as `Date` instances when using date filters. Convert JSON date strings at the API boundary.

## Data ownership and change requests

`mode` decides who owns data operations:

- `mode="client"` (default): the table filters, searches, sorts and then pages the supplied rows. Add `pagination` (or `pagination={true}`) to page them; `currentPage` and `pageSize` set the starting page and size, and the total is counted by the table.
- `mode="server"`: the table renders the rows exactly as supplied. The caller applies filters, search and sorting to the complete data set, determines the matching total and fetches the requested page. `pagination` is controlled: pass `currentPage`, `pageSize` and `totalItems`.

`onChange(request: TableChange)` reports:

- `pagination?`: `{ currentPage, pageSize }`, present when pagination is enabled.
- `sorter?`: `{ field, order: 'asc' | 'desc' }`.
- `filters`: `{ field, value }[]`.
- `columnSearch`: `{ field, value }[]`.
- `searchQuery`: the global search string.

Sorting, filtering and searching reset the current page to 1. `onChange` fires immediately for every change except global search typing, which is debounced by `debounceTime` (default 300 ms). In server mode it also fires once on mount with the initial request, including column defaults, so the consuming app does not need its own initial request. The package does not fetch data or own network loading/error state.

Pagination is 1-based. In server mode, provide the total number of matching records, not the number of rows on the current page. Default size choices are `[10, 20, 50, 100]`; set `pageSizeOptions: false` to hide the selector. The default page size is 10.

## Sorting, filters and search

Sorting is single-column and opt-in using `sortable: true`. Use `defaultSortOrder` for the initial order and `sortFn(a, b)` for an ascending comparator; descending reverses its result. `showSortIcon` controls the header sort button; it defaults to true, or to false when `showMenu` is on (the menu has the same actions). The same default applies to `showFilterIcon` and `showSearchIcon`.

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

`filterOptions` accepts strings or `{ value: string, label: string }` objects. For boolean choices use string values such as `'true'` and `'false'`; the applied filter uses booleans. In server mode, supply all string choices explicitly because the current page cannot describe all available choices; boolean filters offer true and false automatically. Derived string choices are shown as-is. `searchableFilter` adds search inside the choices; `showFilterIcon` controls the trigger.

`filterFn(row, filterValue)` overrides local filtering. `renderFilter(context)` supplies custom draft controls with `value`, `onChange`, `apply` and `reset`. Updating the draft does not apply it; call `apply()` to commit it. Built-in filter and column-search controls also use Apply/Reset.

Enable a column search with `searchable: true`. `showSearchIcon` adds a dedicated trigger and `defaultSearchValue` sets its initial term. Multiple column search terms are combined with AND. `globalSearch` enables the toolbar search and matches across all columns except those explicitly marked `searchable: false`.

Search compares column values (`getValue`, or the row field), not JSX returned by `render`. Only default-rendered cells automatically highlight matching text. Hidden columns keep their active filters/searches.

## Server mode and remote data

This complete consumer component accepts an application-specific `loadPage` function. Its contract is `{ rows: Person[], totalItems: number }`. Implement that function using your backend; forward the request fields using the query/body contract your API expects and parse dates into `Date` values. `columns` and `Person` below refer to the local example saved as `App.tsx`.

```tsx
import { useEffect, useState } from 'react';
import { DataTable, type TableChange } from 'mantine-datatable-lite';
import { columns, type Person } from './App';

type Page = { rows: Person[]; totalItems: number };
type LoadPage = (request: TableChange, signal: AbortSignal) => Promise<Page>;

export function RemoteTable({ loadPage }: { loadPage: LoadPage }) {
  // The table reports its initial request on mount.
  const [request, setRequest] = useState<TableChange | null>(null);
  const [page, setPage] = useState<Page>({ rows: [], totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    if (!request) return;
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
    return column;
  });

  return <DataTable mode='server' rows={page.rows} columns={remoteColumns} globalSearch
    pagination={{ currentPage: request?.pagination?.currentPage ?? 1,
      pageSize: request?.pagination?.pageSize ?? 10, totalItems: page.totalItems }}
    onChange={setRequest} loading={loading} error={error}
    onRetry={() => setRetryVersion((version) => version + 1)} />;
}
```

Keep `loadPage` stable across renders (a module-level function or memoized callback). Aborting and checking the signal prevents obsolete responses from overwriting newer results. Preserve the last successful rows during loading/error. Use `loaderProps` to customize the Mantine loader, and `emptyState` for an empty result.

The documentation server demo fetches a static `employees.json` on every request and applies the request locally; GitHub Pages does not implement a backend. Do not copy that static URL as a production API.

## Selection, expansion and actions

Selection and expansion require a unique stable string or finite numeric ID. `row.id` is the default. Set `idAccessor` to a suitable field or `(row) => stableId` when needed. IDs must be unique across all server pages. Missing/duplicate IDs disable selection/expansion for affected rows; array indices are unsuitable IDs for reordered or paged records.

Selection is configured with `selection`. `selectedIds` is optional: pass it with `onChange(snapshot)` for controlled selection, or omit it and the table keeps the selection itself. The checkbox in the header selects eligible visible rows and has a mixed state when only some are selected. `isSelectable(row)` limits eligibility; `showSelectionCount` controls the count.

Snapshots contain `ids` and `loadedRows`. `loadedRows` contains only selected records available in the supplied rows. It does not fetch records from other pages. Use `ids` for server bulk operations. Selection resets on query changes.

`renderBulkActions` adds a bulk action bar that replaces the toolbar while at least one row is selected. It receives the snapshot plus `clear()`. Confirm destructive actions in the application.

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
  ]} selection={{ selectedIds, onChange: ({ ids }) => setSelectedIds(ids),
    renderBulkActions: ({ ids, clear }) => <Button onClick={clear}>Clear {ids.length} selected</Button>,
  }} expandable={{ render: (row) => <Text>{row.department}: {row.name}</Text>,
    allowMultiple: true, trigger: 'icon',
  }} />;
}
```

Expansion is local unless you supply `expandedIds` and `onChange`. Configure `render(row, index)`, `allowMultiple` (default false) and `trigger: 'icon' | 'row'` (default `'icon'`). `expandable` always takes this config object.

`rowActionsColumn<Row>({ render, header?, width?, pinned? })` creates an action column with default heading Actions, width 80 and right pinning. Its sorting, filtering, search, hiding and pin-menu actions are disabled. Action clicks do not invoke `onRowClick` or row-triggered expansion. Label icon buttons for accessibility. `Icon` accepts a supported `IconName`, size, color, fill and standard SVG props; icon names are listed in the API reference below.

## Menus, pinning and persistence

- `showMenu` enables a column menu. `menuOptions` selects the available groups: `'sort'`, `'filter'`, `'search'`, `'pin'`, `'display'`.
- `pinned: 'left' | 'right'` sets an initial pinned position. Menu pin actions move a column to either side; move actions reorder pinned columns one position at a time. Use widths and `minWidth` to create useful horizontal scrolling.
- `pinnable: false` disables pin-menu actions; `hideable: false` prevents hiding through the menu or picker.
- `columnSelector` enables the column picker; changes are staged until Apply. Hiding affects presentation, not active filtering/search.
- `persistKey` stores hidden/pinned column IDs in `localStorage`. Use a distinct key for each table configuration. It does not persist data, queries, selection or expanded rows.
- `showTableStatePills` adds removable sort, filter and search pills. `maxChips` defaults to 5 and moves extra pills into overflow.
- `showReset` clears sort, filters, searches and column layout changes: all columns become visible and pins return to each column's `pinned` default. It resets the page to 1.

These toolbar features are opt-in. Do not invent a `pinnedColumns` prop; pins are set per column.

## Appearance and row events

Use your Mantine theme and the public props:

- `withTableBorder` and `withColumnBorders` default false; `withRowBorders` defaults true.
- `striped` supports boolean, `'odd'` or `'even'`; `stripedColor` customizes its background.
- `highlightOnHover` and `highlightOnHoverColor` control hovered row backgrounds.
- `borderColor`, `horizontalSpacing`, `verticalSpacing` use Mantine colors/spacing. CSS color variables such as `var(--mantine-color-blue-light)` adapt to the color scheme.
- `layout: 'auto' | 'fixed'` controls CSS table layout.
- `minWidth` creates a horizontal scroll container; `maxHeight` bounds its height. Use `stickyHeader` with `maxHeight` to keep headings visible.
- Column `width` accepts a number or CSS length; `align` accepts `'left' | 'center' | 'right'`.
- `onRowClick(row, index, event)` handles row clicks; clickable rows are focusable and Enter or Space activates them. Action, selection and expansion controls are excluded.
- `rowProps(row, index)` adds standard `<tr>` attributes/styles. Use `render` for custom cell content.

- `labels` replaces built-in UI text, for example for translations. Unlisted labels keep their defaults.

There are no public DataTable `classNames`, `styles` or `vars` slots in this release. Reuse Mantine components, theme tokens and the supported appearance props.

## Rules for code generation

1. Verify the installed package and peer versions, and use the API definitions below for this documented version.
2. Import only public root exports and the documented stylesheet. Keep the existing Mantine provider and CSS order.
3. Decide who owns data operations. Use the default client mode for in-memory rows, including pagination. Use `mode="server"` when the backend filters, searches, sorts and pages.
4. Preserve typed field values. Use `type: 'number'`, `'boolean'` or `'date'` where appropriate; convert JSON dates into `Date` instances.
5. Use unique column keys and stable record IDs. Never use page/display indices for selection or expansion identity.
6. Keep remote fetching, initial load, loading/error state, cancellation, retry and destructive-action confirmation in the consuming app.
7. Do not invent APIs from other table libraries. This release has no `manualSorting`, public `useDataTable`, virtualization, column resizing, editing, grouped/tree rows, multi-column sorting, row drag and drop, built-in CSV/Excel export or select-all-matching-server-records mode.

Suggested prompt: "Use the attached mantine-datatable-lite guide for version 0.1.0-alpha.2. Build a typed Mantine table for my existing React app. Use only the documented public API. Explain whether the table or my application owns the data operations."

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

## API reference

These declarations come from the package, version `0.1.0-alpha.2`. They are reference definitions; import public values and types from `mantine-datatable-lite` in your application. The `RangeFilterValue` and `MantineTableProps` helpers below are not public exports.

```tsx
import type { ComponentProps, ComponentType, CSSProperties, MouseEvent, ReactNode, SVGProps } from 'react';

import type { LoaderProps, MantineSize, TableProps } from '@mantine/core';

export type ColumnType = 'string' | 'number' | 'boolean' | 'date';

export type SortOrder = 'asc' | 'desc';

export type NumericOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'between';

export type IconName = 'sort' | 'sortAsc' | 'sortDesc' | 'filter' | 'search' | 'clear' | 'delete' | 'nextPage' | 'prevPage' | 'firstPage' | 'lastPage' | 'pin' | 'show' | 'hide' | 'collapse' | 'expand' | 'menu' | 'empty';

export type MenuOption = 'sort' | 'filter' | 'search' | 'pin' | 'display';

export type RowId = string | number;

export type IdAccessor<T> = {
    [K in keyof T]-?: T[K] extends RowId ? K : never;
}[keyof T] | ((row: T) => RowId);

export type StringFilterValue = string[];

type RangeFilterValue<V> = {
    operator: 'between';
    value: [V, V];
} | {
    operator: Exclude<NumericOperator, 'between'>;
    value: V;
};

export type NumericFilterValue = RangeFilterValue<number>;

export type BooleanFilterValue = boolean[];

export type DateFilterValue = RangeFilterValue<Date>;

export type FilterValue = StringFilterValue | NumericFilterValue | BooleanFilterValue | DateFilterValue;

export type FilterOption = {
    value: string;
    label: string;
};

export type FilterRenderContext = {
    value?: FilterValue;
    onChange: (value?: FilterValue) => void;
    apply: () => void;
    reset: () => void;
};

export type Filter = {
    field: string;
    value: FilterValue;
};

export type Sorter = {
    field: string;
    order: SortOrder;
};

export type ColumnSearch = {
    field: string;
    value: string;
};

export type PaginationChange = {
    currentPage: number;
    pageSize: number;
};

export type TableChange = {
    /** Present when pagination is enabled. */
    pagination?: PaginationChange;
    sorter?: Sorter;
    filters: Filter[];
    columnSearch: ColumnSearch[];
    searchQuery: string;
};

export interface DataTableColumn<T> {
    /** Unique column ID. Also the row property read when `getValue` is not set. */
    dataIndex: Extract<keyof T, string> | (string & {});
    header: ReactNode;
    /** Value type for sorting and filtering. Default: inferred, otherwise string. */
    type?: ColumnType;
    /** Value used for sorting, filtering, searching and the default cell. Default: `row[dataIndex]`. */
    getValue?: (row: T) => unknown;
    /** Custom cell content. Search highlighting applies only to default cells. */
    render?: (row: T, index: number) => ReactNode;
    align?: 'left' | 'center' | 'right';
    width?: string | number;
    /** Enable sorting. */
    sortable?: boolean;
    /** Initial sort order. The first sortable column that sets it wins. */
    defaultSortOrder?: SortOrder;
    /** Ascending comparator; descending reverses it. */
    sortFn?: (a: T, b: T) => number;
    /** Show the sort button in the header. Default: true, or false when `showMenu` is on. */
    showSortIcon?: boolean;
    /** Enable filtering. */
    filterable?: boolean;
    /** Initial filter value. */
    defaultFilterValue?: FilterValue;
    /** Choices for string and boolean filters. Required for string filters in server mode. */
    filterOptions?: FilterOption[] | string[];
    /** Show a search box above string and boolean filter choices. */
    searchableFilter?: boolean;
    /** Custom predicate for client mode. */
    filterFn?: (row: T, filterValue: FilterValue) => boolean;
    /** Custom filter UI. */
    renderFilter?: (context: FilterRenderContext) => ReactNode;
    /** Show the filter button in the header. Default: true, or false when `showMenu` is on. */
    showFilterIcon?: boolean;
    /**
     * `true` adds a column search. `false` excludes the column from global search.
     * Unset: included in global search only.
     */
    searchable?: boolean;
    /** Initial column search text. Requires `searchable: true`. */
    defaultSearchValue?: string;
    /** Show the search button in the header. Default: true, or false when `showMenu` is on. */
    showSearchIcon?: boolean;
    /** Show the column menu with sort, filter, search, pin and hide actions. */
    showMenu?: boolean;
    /** Limit and order the menu actions. Default: all. */
    menuOptions?: MenuOption[];
    /** Initial pinned side. */
    pinned?: 'left' | 'right';
    /** Allow pinning from the menu. Default: true. */
    pinnable?: boolean;
    /** Allow hiding from the menu and column selector. Default: true. */
    hideable?: boolean;
    /** Keep clicks in this column's cells from triggering `onRowClick` or row expansion. */
    stopRowClick?: boolean;
}

export interface Pagination {
    /** Server mode: current page (controlled). Client mode: initial page. Default: 1. */
    currentPage?: number;
    /** Server mode: page size (controlled). Client mode: initial page size. Default: 10. */
    pageSize?: number;
    /** Server mode: total matching rows (required). Client mode: counted by the table. */
    totalItems?: number;
    /** Page size choices, or false to hide the selector. Default: [10, 20, 50, 100]. */
    pageSizeOptions?: number[] | false;
}

export type SelectionSnapshot<T> = {
    ids: RowId[];
    /** Selected rows present in the current `rows`. Rows from other server pages are not included. */
    loadedRows: T[];
};

export type SelectionConfig<T> = {
    /** Controlled selected IDs. Omit to let the table manage selection. */
    selectedIds?: RowId[];
    onChange?: (selection: SelectionSnapshot<T>) => void;
    /** Rows that return false cannot be selected. */
    isSelectable?: (row: T) => boolean;
    /** Show the selected count in the bulk action bar. Default: true. */
    showSelectionCount?: boolean;
    /** Bulk action bar content. The bar replaces the toolbar while rows are selected. */
    renderBulkActions?: (context: SelectionSnapshot<T> & {
        clear: () => void;
    }) => ReactNode;
};

export type ExpandableConfig<T> = {
    render: (row: T, index: number) => ReactNode;
    /** Controlled expanded IDs. Omit to let the table manage expansion. */
    expandedIds?: RowId[];
    onChange?: (ids: RowId[]) => void;
    /** Allow several expanded rows at once. Default: false. */
    allowMultiple?: boolean;
    /** Expand from the icon or from a row click. Default: 'icon'. */
    trigger?: 'icon' | 'row';
};

export type DateInputProps = {
    /** Date as `YYYY-MM-DD`, or null. */
    value: string | null;
    onChange: (value: string | null) => void;
    size?: MantineSize;
    placeholder?: string;
    'aria-label'?: string;
    popoverProps?: {
        withinPortal?: boolean;
    };
};

export type DataTableLabels = {
    noRecords: string;
    apply: string;
    reset: string;
    retry: string;
    globalSearch: string;
    openGlobalSearch: string;
    clearGlobalSearch: string;
    selectColumns: string;
    resetTable: string;
    sort: string;
    sortAsc: string;
    sortDesc: string;
    clearSort: string;
    filter: string;
    search: string;
    searchOptions: string;
    noOptions: string;
    /** Boolean filter choice labels. */
    true: string;
    false: string;
    pin: string;
    pinLeft: string;
    pinRight: string;
    moveLeft: string;
    moveRight: string;
    unpin: string;
    hide: string;
    from: string;
    to: string;
    value: string;
    operators: Record<NumericOperator, string>;
    sortedBy: string;
    searchPill: string;
    hiddenPill: string;
    morePills: (count: number) => string;
    selectAll: string;
    selectRow: string;
    expandRow: string;
    collapseRow: string;
    clearSelection: string;
    selectedCount: (count: number) => string;
    pageRange: (range: {
        from: number;
        to: number;
        total: number;
    }) => string;
    pageSize: (size: number) => string;
    rowsPerPage: string;
};

type MantineTableProps = Pick<TableProps, 'borderColor' | 'withTableBorder' | 'withColumnBorders' | 'withRowBorders' | 'horizontalSpacing' | 'verticalSpacing' | 'striped' | 'stripedColor' | 'highlightOnHover' | 'highlightOnHoverColor' | 'stickyHeader' | 'layout'>;

export interface DataTableProps<T> extends MantineTableProps {
    columns: DataTableColumn<T>[];
    rows: T[];
    /** Row ID for selection and expansion: a unique, stable string or finite number. Default: `row.id`. */
    idAccessor?: IdAccessor<T>;
    /**
     * `'client'`: the table filters, searches, sorts and pages `rows`.
     * `'server'`: `rows` is the current result; fetch it in `onChange`. Default: `'client'`.
     */
    mode?: 'client' | 'server';
    /** Enable pagination. `true` uses client defaults. */
    pagination?: Pagination | boolean;
    /**
     * Called with the complete table request. Global search typing is debounced; other changes
     * are immediate. In server mode it is also called once on mount with the initial request.
     */
    onChange?: (params: TableChange) => void;
    /** Show the global search in the toolbar. */
    globalSearch?: boolean;
    /** Show the column selector in the toolbar. */
    columnSelector?: boolean;
    /** Show applied sort, filters, searches and hidden columns as removable pills. */
    showTableStatePills?: boolean;
    /** Pills shown before the rest move into a "+N more" popover. Default: 5. */
    maxChips?: number;
    /** Show the reset button in the toolbar. */
    showReset?: boolean;
    /** Global search typing delay in milliseconds. Default: 300. */
    debounceTime?: number;
    selection?: SelectionConfig<T>;
    expandable?: ExpandableConfig<T>;
    onRowClick?: (row: T, index: number, event: MouseEvent<HTMLTableRowElement>) => void;
    rowProps?: (row: T, index: number) => ComponentProps<'tr'>;
    /** Show an overlay over the current rows while the caller loads data. */
    loading?: boolean;
    loaderProps?: LoaderProps;
    /** Error from the caller. The current rows stay visible. */
    error?: ReactNode;
    onRetry?: () => void;
    /** Content shown when there are no rows. */
    emptyState?: ReactNode;
    /** Persist hidden and pinned columns in localStorage under this key. */
    persistKey?: string;
    /** Table width at which it scrolls horizontally. */
    minWidth?: CSSProperties['minWidth'];
    /** Height at which the table scrolls vertically. */
    maxHeight?: CSSProperties['maxHeight'];
    /** Replace built-in UI text. */
    labels?: Partial<DataTableLabels>;
    /** Date input for date filters, e.g. `DatePickerInput` from `@mantine/dates`. Default: a native date input. */
    dateInput?: ComponentType<DateInputProps>;
}

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
    name: IconName;
    size?: number;
    fill?: string;
    color?: string;
};

export declare function rowActionsColumn<T>({ render, header, width, pinned, }: {
    render: (row: T, index: number) => ReactNode;
    header?: ReactNode;
    width?: number;
    pinned?: 'left' | 'right';
}): DataTableColumn<T>;
```
