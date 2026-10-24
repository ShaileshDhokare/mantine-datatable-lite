import axios from 'axios';
import type { Filter, RowId, TableChange } from 'mantine-datatable-lite';

export type Employee = {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  city: string;
  salary: number;
  isActive: boolean;
  joinDate: Date;
};

type EmployeeJson = Omit<Employee, 'joinDate'> & { joinDate: string };

export type EmployeePage = { rows: Employee[]; total: number };

export type FilterOptions = {
  departments: string[];
  roles: string[];
  cities: string[];
};

/** Demo switches; sent as headers that the example server understands. */
export const simulation = { slow: false, failing: false };

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  config.headers.set('X-Simulate-Delay', simulation.slow ? '1500' : '250');
  if (simulation.failing) config.headers.set('X-Simulate-Error', '1');
  return config;
});

/** The server's message, or a generic one. */
export function errorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error))
    return error.response?.data?.message ?? error.message;
  return 'Something went wrong';
}

export function isCancel(error: unknown): boolean {
  return axios.isCancel(error);
}

// JSON has no dates: the API sends YYYY-MM-DD, the table wants Date objects.
function toEmployee(json: EmployeeJson): Employee {
  return { ...json, joinDate: new Date(`${json.joinDate}T00:00:00`) };
}

function calendarDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Date filters hold local-midnight Date objects. JSON.stringify would send them as
 * UTC timestamps, which can land on the previous day, so send calendar days instead.
 */
function serializeFilter(filter: Filter) {
  const { value } = filter;
  if (Array.isArray(value)) return filter;
  const bound = (item: unknown) => (item instanceof Date ? calendarDay(item) : item);
  return {
    field: filter.field,
    value: {
      operator: value.operator,
      value: Array.isArray(value.value) ? value.value.map(bound) : bound(value.value),
    },
  };
}

export async function queryEmployees(
  request: TableChange,
  signal: AbortSignal,
): Promise<EmployeePage> {
  const { data } = await api.post<{ rows: EmployeeJson[]; total: number }>(
    '/employees/query',
    { ...request, filters: request.filters.map(serializeFilter) },
    { signal },
  );
  return { rows: data.rows.map(toEmployee), total: data.total };
}

export async function fetchFilterOptions(): Promise<FilterOptions> {
  const { data } = await api.get<FilterOptions>('/employees/filter-options');
  return data;
}

export async function fetchEmployee(id: RowId): Promise<Employee> {
  const { data } = await api.get<EmployeeJson>(`/employees/${id}`);
  return toEmployee(data);
}

export async function setActive(ids: RowId[], isActive: boolean) {
  const { data } = await api.patch<{ updated: number }>('/employees/status', { ids, isActive });
  return data.updated;
}

export async function deleteEmployees(ids: RowId[]) {
  const { data } = await api.delete<{ deleted: number }>('/employees', { data: { ids } });
  return data.deleted;
}

export async function resetDemoData() {
  await api.post('/demo/reset');
}
