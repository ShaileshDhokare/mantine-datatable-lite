import type { MouseEvent, ReactNode, ComponentProps } from 'react';
import type {
  MantineSpacing,
  MantineColor,
  LoaderProps,
} from '@mantine/core';

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
  | 'empty';

export type MenuOption = 'sort' | 'filter' | 'search' | 'pin' | 'display';
export type RowId = string | number;
export type IdAccessor<T> = {
  [K in keyof T]-?: T[K] extends RowId ? K : never;
}[keyof T] | ((row: T) => RowId);
export type PinnedColumns = { left: string[]; right: string[] };

export type SelectionSnapshot<T> = {
  kind: 'include';
  ids: RowId[];
  loadedRows: T[];
  count: number;
  query: { filters: Filter[]; columnSearch: ColumnSearch[]; search: string };
};

export type SelectionConfig<T> = {
  selectedIds: RowId[];
  onChange: (selection: SelectionSnapshot<T>) => void;
  isSelectable?: (row: T) => boolean;
  showSelectionCount?: boolean;
  renderBulkActions?: (
    context: SelectionSnapshot<T> & { clear: () => void },
  ) => ReactNode;
};

export type ExpandableConfig<T> = {
  render: (row: T, index: number) => ReactNode;
  expandedIds?: RowId[];
  onChange?: (ids: RowId[]) => void;
  allowMultiple?: boolean;
  trigger?: 'icon' | 'row';
};

export type StringFilterValue = string[];
type RangeFilterValue<T> =
  | { operator: 'between'; value: [T, T] }
  | { operator: Exclude<NumericOperator, 'between'>; value: T };
export type NumericFilterValue = RangeFilterValue<number>;
export type BooleanFilterValue = boolean[];
export type DateFilterValue = RangeFilterValue<Date>;

export type FilterValue =
  | StringFilterValue
  | NumericFilterValue
  | BooleanFilterValue
  | DateFilterValue;

export type Filter = {
  field: string;
  value: FilterValue;
};

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

export type Sorter = {
  sortField: string;
  sortOrder: SortOrder;
};

export type ColumnSearch = {
  searchField: string;
  searchValue: string;
};

export interface DataTableColumn<T> {
  dataIndex: Extract<keyof T, string> | (string & {});
  header: ReactNode;
  type?: ColumnType;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  showSortIcon?: boolean;
  defaultSortOrder?: SortOrder;
  sortFn?: (a: T, b: T) => number;
  filterable?: boolean;
  searchable?: boolean;
  showSearchIcon?: boolean;
  defaultSearchValue?: string;
  showFilterIcon?: boolean;
  searchableFilter?: boolean;
  defaultFilterValue?: FilterValue;
  filterOptions?: FilterOption[] | string[];
  filterFn?: (row: T, filterValue: FilterValue) => boolean;
  renderFilter?: (context: FilterRenderContext) => ReactNode;
  width?: string | number;
  showMenu?: boolean;
  menuOptions?: MenuOption[];
  sticky?: 'left' | 'right';
  pinnable?: boolean;
  hideable?: boolean;
  /** Used by rowActionsColumn to keep action clicks out of row handlers. */
  stopRowClick?: boolean;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  defaultPageSize?: number;
  pageSizeOptions?: number[] | false;
  from?: number;
  to?: number;
}

export type PaginationChange = Pick<
  Pagination,
  'currentPage' | 'pageSize' | 'totalItems' | 'from' | 'to'
>;

/** Complete table request. With pagination, the caller supplies the resulting page in rows. */
export type TableChange = {
  pagination?: PaginationChange;
  sorter?: Sorter;
  filters: Filter[];
  columnSearch: ColumnSearch[];
  searchQuery: string;
};

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  pagination?: Pagination;
  globalSearch?: boolean;
  columnSelector?: boolean;
  /** Selection and expansion require a unique, stable string or finite numeric ID. */
  idAccessor?: IdAccessor<T>;
  selection?: SelectionConfig<T>;
  expandable?: ExpandableConfig<T> | boolean;
  expandedRowRender?: (row: T, index: number) => ReactNode;
  onRowClick?: (
    row: T,
    index: number,
    event: MouseEvent<HTMLTableRowElement>,
  ) => void;
  rowProps?: (row: T, index: number) => ComponentProps<'tr'>;
  onChange?: (params: TableChange) => void;
  /** Persist hidden and pinned column IDs in localStorage. */
  persistKey?: string;
  /** Shown over the last supplied rows while the caller loads another page. */
  loading?: boolean;
  loaderProps?: LoaderProps;
  /** Fetch error supplied by the caller. Previous rows remain visible. */
  error?: ReactNode;
  onRetry?: () => void;
  /** Show selection actions when more than one row is selected. */
  toolbar?: boolean;
  /** ActionIcon elements, optionally wrapped in Tooltip. Requires toolbar. */
  toolbarActions?: ReactNode[];
  borderColor?: MantineColor;
  withTableBorder?: boolean;
  withColumnBorders?: boolean;
  withRowBorders?: boolean;
  horizontalSpacing?: MantineSpacing;
  verticalSpacing?: MantineSpacing;
  striped?: boolean | 'odd' | 'even';
  stripedColor?: MantineColor;
  highlightOnHover?: boolean;
  highlightOnHoverColor?: MantineColor;
  stickyHeader?: boolean;
  minWidth?: React.CSSProperties['minWidth'];
  maxHeight?: React.CSSProperties['maxHeight'];
  layout?: 'auto' | 'fixed';
  debounceTime?: number;
  emptyState?: ReactNode;
  showTableStatePills?: boolean;
  showReset?: boolean;
  maxChips?: number;
}
