import type { DataTableColumn, Sorter } from '../../types';
import { compareValues } from './compareValues';
import { resolveColumnType } from './resolveColumnType';

function sortValue(value: unknown, type: DataTableColumn<unknown>['type']): unknown {
  if (value == null) return null;
  type ??= value instanceof Date ? 'date' : typeof value === 'number' ? 'number' : undefined;
  if (type === 'number') {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }
  if (type === 'date') {
    const time = value instanceof Date ? value.getTime() : new Date(value as string | number).getTime();
    return Number.isFinite(time) ? time : null;
  }
  return value;
}

export function sortRows<T>(rows: T[], columns: DataTableColumn<T>[], sorter?: Sorter): T[] {
  if (!sorter) return rows;
  const column = columns.find((item) => item.dataIndex === sorter.sortField && item.sortable);
  if (!column) return rows;

  return [...rows].sort((a, b) => {
    if (column.sortFn) {
      const result = column.sortFn(a, b);
      return sorter.sortOrder === 'asc' ? result : -result;
    }

    const leftRaw = (a as Record<string, unknown>)[column.dataIndex];
    const rightRaw = (b as Record<string, unknown>)[column.dataIndex];
    const type = resolveColumnType(leftRaw, rightRaw, column.type);
    const left = sortValue(leftRaw, column.type);
    const right = sortValue(rightRaw, column.type);
    if (left == null || right == null) return left == null ? (right == null ? 0 : 1) : -1;

    const result = compareValues(left, right, type === 'date' ? 'number' : type);
    return sorter.sortOrder === 'asc' ? result : -result;
  });
}
