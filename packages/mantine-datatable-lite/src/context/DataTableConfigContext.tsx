import { createContext, useContext, type ComponentType } from 'react';
import { defaultLabels } from '../labels';
import type { DataTableLabels, DateInputProps } from '../types';

type DataTableConfig = {
  labels: DataTableLabels;
  dateInput?: ComponentType<DateInputProps>;
};

export const DataTableConfigContext = createContext<DataTableConfig>({
  labels: defaultLabels,
});

export function useDataTableConfig() {
  return useContext(DataTableConfigContext);
}
