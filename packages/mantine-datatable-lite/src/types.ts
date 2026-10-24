import type {
  ComponentProps,
  ComponentType,
  CSSProperties,
  MouseEvent,
  ReactNode,
} from 'react';
import type { LoaderProps, MantineSize, TableProps } from '@mantine/core';

export type ColumnType = 'string' | 'number' | 'boolean' | 'date';
export type SortOrder = 'asc' | 'desc';

export type NumericOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'between';

export type IconName =
  | 'sort'
  | 'sortAsc'
  | 'sortDesc'
  | 'filter'
  | 'search'
  | 'clear'
  | 'delete'
  | 'nextPage'
  | 'prevPage'
  | 'firstPage'
  | 'lastPage'
  | 'pin'
  | 'show'
  | 'hide'
  | 'collapse'
  | 'expand'
  | 'menu'
  | 'empty'
  | 'error';

export type MenuOption = 'sort' | 'filter' | 'search' | 'pin' | 'display';
export type RowId = string | number;
export type IdAccessor<T> =
  | {
      [K in keyof T]-?: T[K] extends RowId ? K : never;
    }[keyof T]
  | ((row: T) => RowId);

// Filter values

export type StringFilterValue = string[];
type RangeFilterValue<V> =
  | { operator: 'between'; value: [V, V] }
  | { operator: Exclude<NumericOperator, 'between'>; value: V };
export type NumericFilterValue = RangeFilterValue<number>;
export type BooleanFilterValue = boolean[];
export type DateFilterValue = RangeFilterValue<Date>;

export type FilterValue =
  | StringFilterValue
  | NumericFilterValue
  | BooleanFilterValue
  | DateFilterValue;

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

// Table state reported through onChange

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

/** Complete table request. Sorting, filtering and searching reset the page to 1. */
export type TableChange = {
  /** Present when pagination is enabled. */
  pagination?: PaginationChange;
  sorter?: Sorter;
  filters: Filter[];
  columnSearch: ColumnSearch[];
  searchQuery: string;
};

// Columns

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

// Features

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
  renderBulkActions?: (
    context: SelectionSnapshot<T> & { clear: () => void },
  ) => ReactNode;
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

/** Props passed to a custom date input. Mantine's `DatePickerInput` and `DateInput` fit. */
export type DateInputProps = {
  /** Date as `YYYY-MM-DD`, or null. */
  value: string | null;
  onChange: (value: string | null) => void;
  size?: MantineSize;
  placeholder?: string;
  'aria-label'?: string;
  popoverProps?: { withinPortal?: boolean };
};

/** Built-in UI text, including screen reader labels, and date formatting for pills. */
export type DataTableLabels = {
  noRecords: string;
  apply: string;
  reset: string;
  retry: string;
  /** Error message shown when `error` is `true`. */
  loadError: string;
  globalSearch: string;
  openGlobalSearch: string;
  clearGlobalSearch: string;
  selectColumns: string;
  resetTable: string;
  /** Column menu item, and the prefix of the header filter and search buttons' labels. */
  sort: string;
  sortAsc: string;
  sortDesc: string;
  clearSort: string;
  /** Header sort button label. `order` is the current sort. */
  sortColumn: (column: string, order: SortOrder | undefined) => string;
  /** Sort order shown in the sort pill. */
  sortOrder: Record<SortOrder, string>;
  /** Column menu button label. */
  columnMenu: (column: string) => string;
  filter: string;
  search: string;
  searchOptions: string;
  noOptions: string;
  /** Number and date filter operator select label. */
  filterOperator: (column: string) => string;
  /** Number and date filter input label. `input` is the `value`, `from` or `to` label. */
  filterInput: (column: string, input: string) => string;
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
  /** Remove button label of a pill. `pill` is the pill's text. */
  removePill: (pill: string) => string;
  /** Dates in filter pills. Default: the browser locale's short date. */
  formatDate: (date: Date) => string;
  selectAll: string;
  selectRow: string;
  expandRow: string;
  collapseRow: string;
  clearSelection: string;
  selectedCount: (count: number) => string;
  pageRange: (range: { from: number; to: number; total: number }) => string;
  pageSize: (size: number) => string;
  rowsPerPage: string;
  /** First, previous, next and last page button labels. */
  pageControl: (control: 'first' | 'previous' | 'next' | 'last') => string;
};

type MantineTableProps = Pick<
  TableProps,
  | 'borderColor'
  | 'withTableBorder'
  | 'withColumnBorders'
  | 'withRowBorders'
  | 'horizontalSpacing'
  | 'verticalSpacing'
  | 'striped'
  | 'stripedColor'
  | 'highlightOnHover'
  | 'highlightOnHoverColor'
  | 'stickyHeader'
  | 'layout'
>;

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
  onRowClick?: (
    row: T,
    index: number,
    event: MouseEvent<HTMLTableRowElement>,
  ) => void;
  rowProps?: (row: T, index: number) => ComponentProps<'tr'>;

  /** Show an overlay over the current rows while the caller loads data. */
  loading?: boolean;
  loaderProps?: LoaderProps;
  /**
   * Error from the caller, shown in place of the rows with an error icon. Pass a message,
   * or `true` for the default `loadError` label.
   */
  error?: ReactNode;
  /** Shows a Retry button under the error. */
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
  /** Accessible name for the table. Set this or `aria-labelledby` when no visible heading names the table. */
  'aria-label'?: string;
  /** ID of the element that names the table, such as a page heading. */
  'aria-labelledby'?: string;
  /** Date input for date filters, e.g. `DatePickerInput` from `@mantine/dates`. Default: a native date input. */
  dateInput?: ComponentType<DateInputProps>;
}
