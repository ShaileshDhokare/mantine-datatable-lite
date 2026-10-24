import type {
  DataTableColumn,
  Filter,
  FilterValue,
  NumericOperator,
} from '../../types';
import { columnValue } from '../columnValue';

export function activeFilter(value: FilterValue | undefined): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (!value) return false;
  const bounds = value.value;
  if (value.operator === 'between') {
    return (
      Array.isArray(bounds) && bounds.length === 2 && bounds.every(isPresent)
    );
  }
  return !Array.isArray(bounds) && isPresent(bounds);
}

function isPresent(value: unknown): boolean {
  return (
    value !== null &&
    value !== undefined &&
    value !== '' &&
    (!(value instanceof Date) || !Number.isNaN(value.getTime())) &&
    (typeof value !== 'number' || Number.isFinite(value))
  );
}

function compare(
  value: number,
  operator: NumericOperator,
  bound: number | [number, number],
): boolean {
  if (operator === 'between') {
    if (!Array.isArray(bound)) return true;
    return value >= Math.min(...bound) && value <= Math.max(...bound);
  }
  if (Array.isArray(bound)) return true;
  switch (operator) {
    case 'eq':
      return value === bound;
    case 'neq':
      return value !== bound;
    case 'gt':
      return value > bound;
    case 'gte':
      return value >= bound;
    case 'lt':
      return value < bound;
    case 'lte':
      return value <= bound;
  }
}

function day(value: unknown): number {
  const date =
    value instanceof Date ? value : new Date(value as string | number);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

export function matchesFilter(
  value: unknown,
  filter: FilterValue,
  type: DataTableColumn<unknown>['type'],
): boolean {
  if (!activeFilter(filter)) return true;
  if (value === null || value === undefined) return false;
  if (Array.isArray(filter)) {
    return type === 'boolean'
      ? (filter as boolean[]).includes(value as boolean)
      : (filter as string[]).includes(String(value));
  }
  if (type === 'date') {
    const actual = day(value);
    const bounds = Array.isArray(filter.value)
      ? (filter.value.map(day) as [number, number])
      : day(filter.value);
    return (
      Number.isFinite(actual) &&
      (Array.isArray(bounds)
        ? bounds.every(Number.isFinite)
        : Number.isFinite(bounds)) &&
      compare(actual, filter.operator, bounds)
    );
  }
  const actual = Number(value);
  if (!Number.isFinite(actual)) return false;
  const bounds = Array.isArray(filter.value)
    ? (filter.value.map(Number) as [number, number])
    : Number(filter.value);
  return (
    (Array.isArray(bounds)
      ? bounds.every(Number.isFinite)
      : Number.isFinite(bounds)) && compare(actual, filter.operator, bounds)
  );
}

export function filterRows<T>(
  rows: T[],
  columns: DataTableColumn<T>[],
  filters: Filter[],
): T[] {
  const active = filters.flatMap((filter) => {
    const column = columns.find(
      (item) => item.dataIndex === filter.field && item.filterable,
    );
    return column && activeFilter(filter.value)
      ? [{ column, value: filter.value }]
      : [];
  });
  if (!active.length) return rows;
  return rows.filter((row) =>
    active.every(({ column, value }) =>
      column.filterFn
        ? column.filterFn(row, value)
        : matchesFilter(columnValue(column, row), value, column.type),
    ),
  );
}
