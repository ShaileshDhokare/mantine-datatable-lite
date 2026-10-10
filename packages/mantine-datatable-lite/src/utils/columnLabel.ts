import type { DataTableColumn } from '../types';

export function columnLabel<T>(column: DataTableColumn<T>): string {
  return typeof column.header === 'string' || typeof column.header === 'number'
    ? String(column.header)
    : column.dataIndex;
}
