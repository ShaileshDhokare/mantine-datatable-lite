import { createContext, useContext } from 'react';
import type {
  ColumnSearch,
  Filter,
  FilterValue,
  PinnedColumns,
  SortOrder,
  Sorter,
} from '../types';

type DataTableContextValue = {
  sorter?: Sorter;
  setSort: (field: string, order?: SortOrder | null) => void;
  filters: Filter[];
  setFilter: (field: string, value?: FilterValue) => void;
  openFilter: string | null;
  setOpenFilter: (field: string | null) => void;
  columnSearch: ColumnSearch[];
  setColumnSearch: (field: string, value: string) => void;
  openSearch: string | null;
  setOpenSearch: (field: string | null) => void;
  searchQuery: string;
  setSearchQuery: (value: string, immediate?: boolean) => void;
  hiddenColumns: string[];
  setHiddenColumns: (fields: string[]) => void;
  setColumnHidden: (field: string, hidden: boolean) => void;
  pinned: PinnedColumns;
  pinColumn: (field: string, side: 'left' | 'right' | null) => void;
  movePinned: (field: string, direction: -1 | 1) => void;
  clearAll: () => void;
  resetVersion: number;
};

export const DataTableContext = createContext<DataTableContextValue | null>(
  null,
);

export function useDataTableContext() {
  const context = useContext(DataTableContext);
  if (!context)
    throw new Error('DataTable components must be inside DataTableContext');
  return context;
}
