import type { DataTableColumn, Sorter } from '../../types';
import { compareValues } from './compareValues';

export function sortRows<T>(rows: T[], columns: DataTableColumn<T>[], sorter?: Sorter): T[] {
  if (!sorter) return rows;
  const column = columns.find((item) => item.dataIndex === sorter.sortField && item.sortable);
  if (!column) return rows;

  return [...rows].sort((a, b) => {
    if (column.sortFn) {
      const result = column.sortFn(a, b);
      return sorter.sortOrder === 'asc' ? result : -result;
    }

    const left = (a as Record<string, unknown>)[column.dataIndex];
    const right = (b as Record<string, unknown>)[column.dataIndex];
    if (left == null || right == null) return left == null ? (right == null ? 0 : 1) : -1;

    const result = compareValues(left, right, column.type);
    return sorter.sortOrder === 'asc' ? result : -result;
  });
}
