import type { DataTableColumn } from '../types';

/** The value a column sorts, filters, searches and displays. */
export function columnValue<T>(column: DataTableColumn<T>, row: T): unknown {
  if (column.getValue) return column.getValue(row);
  return row == null
    ? undefined
    : (row as Record<string, unknown>)[column.dataIndex];
}
