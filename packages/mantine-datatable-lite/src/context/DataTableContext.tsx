import { createContext, useContext } from 'react';
import type { ColumnSearch, Filter, FilterValue, SortOrder, Sorter } from '../types';

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
};

export const DataTableContext = createContext<DataTableContextValue | null>(null);

export function useDataTableContext() {
  const context = useContext(DataTableContext);
  if (!context) throw new Error('DataTable components must be inside DataTableContext');
  return context;
}
