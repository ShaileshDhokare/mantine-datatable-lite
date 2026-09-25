import { createContext, useContext } from 'react';
import type { SortOrder, Sorter } from '../types';

type DataTableContextValue = {
  sorter?: Sorter;
  setSort: (field: string, order?: SortOrder | null) => void;
};

export const DataTableContext = createContext<DataTableContextValue | null>(null);

export function useDataTableContext() {
  const context = useContext(DataTableContext);
  if (!context) throw new Error('DataTable components must be inside DataTableContext');
  return context;
}
