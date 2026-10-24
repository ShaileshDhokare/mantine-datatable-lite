import type { Filter, RowId, TableChange } from 'mantine-datatable-lite';
import type {
  Employee,
  EmployeeDetails,
  EmployeeJson,
  EmployeePage,
  FilterOptions,
} from '../types/employee';
import { fromCalendarDay, toCalendarDay } from '../utils/dates';
import { http } from './http';

// JSON has no dates: the API sends YYYY-MM-DD, the table wants Date objects.
const toEmployee = (json: EmployeeJson): Employee => ({
  ...json,
  joinDate: fromCalendarDay(json.joinDate),
});

/**
 * Date filters hold local-midnight Date objects. JSON.stringify would send them as
 * UTC timestamps, which can land on the previous day, so send calendar days instead.
 */
function serializeFilter(filter: Filter) {
  const { value } = filter;
  if (Array.isArray(value)) return filter;
  const bound = (item: unknown) => (item instanceof Date ? toCalendarDay(item) : item);
  return {
    field: filter.field,
    value: {
      operator: value.operator,
      value: Array.isArray(value.value) ? value.value.map(bound) : bound(value.value),
    },
  };
}

/** One page for the server-side table. */
export async function queryEmployees(
  request: TableChange,
  signal: AbortSignal,
): Promise<EmployeePage> {
  const { data } = await http.post<{ rows: EmployeeJson[]; total: number }>(
    '/employees/query',
    { ...request, filters: request.filters.map(serializeFilter) },
    { signal },
  );
  return { rows: data.rows.map(toEmployee), total: data.total };
}

/** Every employee, for the client-side table. */
export async function fetchAllEmployees(signal: AbortSignal): Promise<Employee[]> {
  const { data } = await http.get<EmployeeJson[]>('/employees', { signal });
  return data.map(toEmployee);
}

export async function fetchFilterOptions(signal: AbortSignal): Promise<FilterOptions> {
  const { data } = await http.get<FilterOptions>('/employees/filter-options', { signal });
  return data;
}

export async function fetchEmployee(id: RowId, signal: AbortSignal): Promise<Employee> {
  const { data } = await http.get<EmployeeJson>(`/employees/${id}`, { signal });
  return toEmployee(data);
}

export async function fetchEmployeeDetails(
  id: RowId,
  signal: AbortSignal,
): Promise<EmployeeDetails> {
  const { data } = await http.get<EmployeeDetails>(`/employees/${id}/details`, { signal });
  return data;
}

/** @returns Number of employees updated. */
export async function setEmployeesActive(ids: RowId[], isActive: boolean) {
  const { data } = await http.patch<{ updated: number }>('/employees/status', { ids, isActive });
  return data.updated;
}

/** @returns Number of employees deleted. */
export async function deleteEmployees(ids: RowId[]) {
  const { data } = await http.delete<{ deleted: number }>('/employees', { data: { ids } });
  return data.deleted;
}

export async function resetDemoData() {
  await http.post('/demo/reset');
}
