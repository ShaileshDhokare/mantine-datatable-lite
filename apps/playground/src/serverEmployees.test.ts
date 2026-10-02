import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.resetModules(); });

test('fetches JSON on every request with query parameters and returns the requested page', async () => {
  const fetchMock = vi.fn(async (url: string, options: RequestInit) => ({
    ok: Boolean(url && options),
    json: async () => [
      { id: 1, name: 'Alice', department: 'Engineering', email: 'a@example.com', role: 'Engineer',
        age: 30, salary: 100, isActive: true, joinDate: '2020-01-01T00:00:00.000Z' },
      { id: 2, name: 'Bob', department: 'Design', email: 'b@example.com', role: 'Designer',
        age: 32, salary: 200, isActive: true, joinDate: '2021-01-01T00:00:00.000Z' },
      { id: 3, name: 'Carol', department: 'Engineering', email: 'c@example.com', role: 'Engineer',
        age: 28, salary: 300, isActive: false, joinDate: '2022-01-01T00:00:00.000Z' },
    ],
  }));
  vi.stubGlobal('fetch', fetchMock);
  const { fetchEmployeePage } = await import('./serverEmployees');
  const signal = new AbortController().signal;
  const request = {
    pagination: { currentPage: 1, pageSize: 1, totalItems: 0 },
    filters: [{ field: 'department', value: ['Engineering'] }],
    sorter: { sortField: 'salary', sortOrder: 'desc' as const },
    searchQuery: 'engineer',
    columnSearch: [],
  };
  const first = await fetchEmployeePage(request, signal);
  const second = await fetchEmployeePage({ ...request, pagination: { ...request.pagination, currentPage: 2 } }, signal);
  expect(first.rows.map((row) => row.name)).toEqual(['Carol']);
  expect(second.rows.map((row) => row.name)).toEqual(['Alice']);
  expect(first.totalItems).toBe(2);
  expect(first.rows[0].joinDate).toBeInstanceOf(Date);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  const firstUrl = new URL(String(fetchMock.mock.calls[0][0]), 'http://localhost');
  const secondUrl = new URL(String(fetchMock.mock.calls[1][0]), 'http://localhost');
  expect(firstUrl.pathname).toContain('employees.json');
  expect(firstUrl.searchParams.get('currentPage')).toBe('1');
  expect(secondUrl.searchParams.get('currentPage')).toBe('2');
  expect(firstUrl.searchParams.get('pageSize')).toBe('1');
  expect(firstUrl.searchParams.get('sortField')).toBe('salary');
  expect(firstUrl.searchParams.get('sortOrder')).toBe('desc');
  expect(JSON.parse(firstUrl.searchParams.get('filters')!)).toEqual(request.filters);
  expect(firstUrl.searchParams.get('searchQuery')).toBe('engineer');
  expect(fetchMock.mock.calls[0][1]).toEqual({ signal });
});
