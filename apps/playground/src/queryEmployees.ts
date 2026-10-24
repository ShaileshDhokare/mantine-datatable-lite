import type { ColumnSearch, Filter, NumericOperator, Sorter, TableChange } from 'mantine-datatable-lite';
import type { Employee } from './data';

const globalSearchFields: (keyof Employee)[] = ['name', 'email', 'department', 'role'];

function matchesRange(actual: number, operator: NumericOperator, value: number | [number, number]) {
  if (operator === 'between') {
    return Array.isArray(value) && actual >= Math.min(...value) && actual <= Math.max(...value);
  }
  if (Array.isArray(value)) return false;
  switch (operator) {
    case 'eq': return actual === value;
    case 'neq': return actual !== value;
    case 'gt': return actual > value;
    case 'gte': return actual >= value;
    case 'lt': return actual < value;
    case 'lte': return actual <= value;
  }
}

function matchesFilter(employee: Employee, filter: Filter) {
  const actual = employee[filter.field as keyof Employee];
  if (Array.isArray(filter.value)) return filter.value.some((choice) => choice === actual);
  const numeric = actual instanceof Date ? actual.getTime() : Number(actual);
  const raw = filter.value.value;
  const asNumber = (value: number | Date) => value instanceof Date ? value.getTime() : value;
  const bound = Array.isArray(raw) ? raw.map(asNumber) as [number, number] : asNumber(raw);
  return matchesRange(numeric, filter.value.operator, bound);
}

function sortEmployees(rows: Employee[], sorter?: Sorter) {
  if (!sorter) return rows;
  const field = sorter.field as keyof Employee;
  return [...rows].sort((a, b) => {
    const left = a[field];
    const right = b[field];
    const result = left instanceof Date && right instanceof Date
      ? left.getTime() - right.getTime()
      : typeof left === 'number' && typeof right === 'number'
        ? left - right
        : typeof left === 'boolean' && typeof right === 'boolean'
          ? Number(left) - Number(right)
          : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
    return sorter.order === 'asc' ? result : -result;
  });
}

export function queryEmployees(rows: Employee[], state: Pick<TableChange, 'sorter' | 'filters' | 'columnSearch' | 'searchQuery'>) {
  const globalTerm = state.searchQuery.toLocaleLowerCase();
  const filtered = rows.filter((employee) =>
    state.filters.every((filter) => matchesFilter(employee, filter)) &&
    state.columnSearch.every(({ field, value }: ColumnSearch) =>
      String(employee[field as keyof Employee] ?? '').toLocaleLowerCase().includes(value.toLocaleLowerCase())) &&
    (!globalTerm || globalSearchFields.some((field) =>
      String(employee[field]).toLocaleLowerCase().includes(globalTerm))),
  );
  return sortEmployees(filtered, state.sorter);
}
