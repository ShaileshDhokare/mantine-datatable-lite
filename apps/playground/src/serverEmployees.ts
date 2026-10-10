import type { TableChange } from 'mantine-datatable-lite';
import type { Employee } from './data';
import { queryEmployees } from './queryEmployees';

type JsonEmployee = Omit<Employee, 'joinDate'> & { joinDate: string };

function requestUrl(request: TableChange) {
  const params = new URLSearchParams();
  const page = request.pagination;
  if (page) {
    params.set('currentPage', String(page.currentPage));
    params.set('pageSize', String(page.pageSize));
    params.set('totalItems', String(page.totalItems));
    if (page.from != null) params.set('from', String(page.from));
    if (page.to != null) params.set('to', String(page.to));
  }
  if (request.sorter) {
    params.set('sortField', request.sorter.sortField);
    params.set('sortOrder', request.sorter.sortOrder);
  }
  params.set('filters', JSON.stringify(request.filters));
  params.set('columnSearch', JSON.stringify(request.columnSearch));
  params.set('searchQuery', request.searchQuery);
  return `${import.meta.env.BASE_URL}employees.json?${params.toString()}`;
}

/** Static JSON ignores query parameters; they illustrate the request a real API would receive. */
export async function fetchEmployeePage(request: TableChange, signal: AbortSignal) {
  const response = await fetch(requestUrl(request), { signal });
  if (!response.ok) throw new Error(`Could not load employees (${response.status})`);
  const json = await response.json() as JsonEmployee[];
  if (signal.aborted) throw new DOMException('Request aborted', 'AbortError');
  const all = json.map((row) => ({ ...row, joinDate: new Date(row.joinDate) }));
  const matched = queryEmployees(all, request);
  const page = request.pagination?.currentPage ?? 1;
  const size = request.pagination?.pageSize ?? 10;
  return {
    rows: matched.slice((page - 1) * size, page * size),
    totalItems: matched.length,
  };
}
