import type { ReactNode } from 'react';
import type {
  MantineSpacing,
  MantineColor,
  ActionIconProps,
} from '@mantine/core';

export type ColumnType = 'string' | 'number' | 'boolean' | 'date';
export type SortOrder = 'asc' | 'desc';

export type NumericOperator = 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'between';

export type IconName =
  | 'sort'
  | 'sortAsc'
  | 'sortDesc'
  | 'filter'
  | 'search'
  | 'clear'
  | 'nextPage'
  | 'prevPage'
  | 'firstPage'
  | 'lastPage'
  | 'pin'
  | 'show'
  | 'hide'
  | 'collapse'
  | 'expand'
  | 'menu';

export type MenuOption = 'sort' | 'filter' | 'search' | 'pin' | 'display';

export type StringFilterValue = string[];
export type NumericFilterValue = {
  operator: NumericOperator;
  value: number | [number, number];
};
export type BooleanFilterValue = boolean[];
export type DateFilterValue = {
  operator: NumericOperator;
  value: Date | [Date, Date];
};

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
  defaultSortOrder?: SortOrder;
  sortFn?: (a: T, b: T) => number;
  filterable?: boolean;
  searchableFilter?: boolean;
  defaultFilterValue?: FilterValue;
  filterOptions?: FilterOption[];
  filterFn?: (row: T, filterValue: FilterValue) => boolean;
  width?: string | number;
  showMenu?: boolean;
  menuOptions?: MenuOption[];
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  from?: number;
  to?: number;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  pagination?: Pagination;
  globalSearch?: boolean;
  columnSelector?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  expandedRowRender?: (row: T, index: number) => ReactNode;
  loading?: boolean;
  onChange?: (params: {
    pagination?: Pagination;
    sorter?: Sorter;
    filters?: Filter[];
    columnSearch?: ColumnSearch[];
    searchQuery?: string;
  }) => void;
  toolbar?: boolean;
  toolbarActions?: React.ComponentType<ActionIconProps>[];
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
}
