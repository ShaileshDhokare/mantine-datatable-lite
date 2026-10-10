import { MantineProvider } from '@mantine/core';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { DataTable } from './components/DataTable';
import type { Pagination } from './types';

const columns = [
  { dataIndex: 'name', header: 'Name', sortable: true, searchable: true },
];
const rows = [{ name: 'Alice' }, { name: 'Bob' }];

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function show(pagination: Pagination, onChange = vi.fn()) {
  return render(
    <MantineProvider env='test'>
      <DataTable
        columns={columns}
        rows={rows}
        pagination={pagination}
        onChange={onChange}
        globalSearch
      />
    </MantineProvider>,
  );
}

test('shows the item range and reports page and size changes', () => {
  const onChange = vi.fn();
  show({ currentPage: 2, pageSize: 10, totalItems: 25 }, onChange);
  expect(screen.getByText('Showing 11 - 20 of 25 items')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '3' }));
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      pagination: {
        currentPage: 3,
        pageSize: 10,
        totalItems: 25,
        from: 21,
        to: 25,
      },
    }),
  );
  fireEvent.click(screen.getByRole('combobox', { name: 'Rows per page' }));
  fireEvent.click(screen.getByRole('option', { name: '20 / page' }));
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      pagination: {
        currentPage: 1,
        pageSize: 20,
        totalItems: 25,
        from: 1,
        to: 20,
      },
    }),
  );
});

test('fixed size hides the selector and an unmatched size joins custom options', () => {
  const view = show({
    currentPage: 1,
    pageSize: 15,
    totalItems: 35,
    pageSizeOptions: [10, 20],
  });
  fireEvent.click(screen.getByRole('combobox', { name: 'Rows per page' }));
  expect(screen.getByRole('option', { name: '15 / page' })).toBeTruthy();
  view.rerender(
    <MantineProvider env='test'>
      <DataTable
        columns={columns}
        rows={rows}
        pagination={{
          currentPage: 1,
          pageSize: 15,
          totalItems: 35,
          pageSizeOptions: false,
        }}
      />
    </MantineProvider>,
  );
  expect(screen.queryByRole('combobox', { name: 'Rows per page' })).toBeNull();
});

test('clamps a shrinking total and keeps empty pagination visible but disabled', () => {
  const onChange = vi.fn();
  const view = show({ currentPage: 4, pageSize: 10, totalItems: 35 }, onChange);
  view.rerender(
    <MantineProvider env='test'>
      <DataTable
        columns={columns}
        rows={rows}
        pagination={{ currentPage: 4, pageSize: 10, totalItems: 21 }}
        onChange={onChange}
      />
    </MantineProvider>,
  );
  expect(screen.getByText('Showing 21 - 21 of 21 items')).toBeTruthy();
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      pagination: {
        currentPage: 3,
        pageSize: 10,
        totalItems: 21,
        from: 21,
        to: 21,
      },
    }),
  );
  view.rerender(
    <MantineProvider env='test'>
      <DataTable
        columns={columns}
        rows={[]}
        pagination={{ currentPage: 1, pageSize: 10, totalItems: 0 }}
      />
    </MantineProvider>,
  );
  expect(screen.getByText('Showing 0 - 0 of 0 items')).toBeTruthy();
  expect(
    screen.getByRole('button', { name: '1' }).hasAttribute('disabled'),
  ).toBe(true);
});

test('sort, filter, and search requests return to page one while retaining size', () => {
  vi.useFakeTimers();
  const onChange = vi.fn();
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={[
          { ...columns[0], filterable: true, filterOptions: ['Alice', 'Bob'] },
        ]}
        rows={rows}
        pagination={{ currentPage: 3, pageSize: 20, totalItems: 100 }}
        onChange={onChange}
        globalSearch
      />
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Sort Name: none' }));
  act(() => vi.advanceTimersByTime(300));
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      pagination: {
        currentPage: 1,
        pageSize: 20,
        totalItems: 100,
        from: 1,
        to: 20,
      },
    }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Filter Name' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Alice' }));
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
  act(() => vi.advanceTimersByTime(300));
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      pagination: expect.objectContaining({ currentPage: 1, pageSize: 20 }),
      filters: [{ field: 'name', value: ['Alice'] }],
    }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open global search' }));
  fireEvent.change(
    screen.getByRole('textbox', { name: 'Search all columns' }),
    { target: { value: 'bob' } },
  );
  act(() => vi.advanceTimersByTime(300));
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      pagination: expect.objectContaining({ currentPage: 1, pageSize: 20 }),
      searchQuery: 'bob',
    }),
  );
});

test('loading and error keep supplied rows visible and let the caller retry', () => {
  const onRetry = vi.fn();
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={columns}
        rows={rows}
        pagination={{ currentPage: 1, pageSize: 10, totalItems: 20 }}
        loading
        error='Request failed'
        onRetry={onRetry}
      />
    </MantineProvider>,
  );
  expect(screen.getByRole('table').textContent).toContain('Alice');
  expect(screen.getByRole('alert').textContent).toContain('Request failed');
  expect(
    screen.getByRole('table').parentElement?.getAttribute('aria-busy'),
  ).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

test('page change sends the latest sort in the complete request', () => {
  vi.useFakeTimers();
  const onChange = vi.fn();
  show({ currentPage: 3, pageSize: 10, totalItems: 40 }, onChange);
  fireEvent.click(screen.getByRole('button', { name: 'Sort Name: none' }));
  fireEvent.click(screen.getByRole('button', { name: '2' }));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith({
    pagination: {
      currentPage: 2,
      pageSize: 10,
      totalItems: 40,
      from: 11,
      to: 20,
    },
    sorter: { sortField: 'name', sortOrder: 'asc' },
    filters: [],
    columnSearch: [],
    searchQuery: '',
  });
  act(() => vi.advanceTimersByTime(300));
  expect(onChange).toHaveBeenCalledTimes(1);
});

test('externally owned pages render only supplied rows and trust the supplied total', () => {
  show({ currentPage: 2, pageSize: 10, totalItems: 100 });
  expect(screen.getAllByRole('row')).toHaveLength(3);
  expect(screen.getByText('Showing 11 - 20 of 100 items')).toBeTruthy();
});
