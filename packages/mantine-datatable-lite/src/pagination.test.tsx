import { Loader, MantineProvider } from '@mantine/core';
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

function showServer(pagination: Pagination, onChange = vi.fn()) {
  return render(
    <MantineProvider env='test'>
      <DataTable
        mode='server'
        columns={columns}
        rows={rows}
        pagination={pagination}
        onChange={onChange}
        globalSearch
      />
    </MantineProvider>,
  );
}

const people = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  name: `Person ${String(index + 1).padStart(2, '0')}`,
  team: index % 2 ? 'Blue' : 'Red',
}));
const names = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => row.textContent);

test('server mode shows the item range and reports page and size changes', () => {
  const onChange = vi.fn();
  showServer({ currentPage: 2, pageSize: 10, totalItems: 25 }, onChange);
  expect(screen.getByText('Showing 11 - 20 of 25 items')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '3' }));
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      pagination: { currentPage: 3, pageSize: 10 },
    }),
  );
  fireEvent.click(screen.getByRole('combobox', { name: 'Rows per page' }));
  fireEvent.click(screen.getByRole('option', { name: '20 / page' }));
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      pagination: { currentPage: 1, pageSize: 20 },
    }),
  );
});

test('fixed size hides the selector and an unmatched size joins custom options', () => {
  const view = showServer({
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
        mode='server'
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

test('clamps a shrinking server total and keeps empty pagination visible but disabled', () => {
  const onChange = vi.fn();
  const view = showServer(
    { currentPage: 4, pageSize: 10, totalItems: 35 },
    onChange,
  );
  view.rerender(
    <MantineProvider env='test'>
      <DataTable
        mode='server'
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
      pagination: { currentPage: 3, pageSize: 10 },
    }),
  );
  view.rerender(
    <MantineProvider env='test'>
      <DataTable
        mode='server'
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
        mode='server'
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
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      pagination: { currentPage: 1, pageSize: 20 },
    }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Filter Name' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Alice' }));
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      pagination: { currentPage: 1, pageSize: 20 },
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
      pagination: { currentPage: 1, pageSize: 20 },
      searchQuery: 'bob',
    }),
  );
});

test('loading keeps supplied rows visible and marks the table busy', () => {
  render(
    <MantineProvider env='test'>
      <DataTable
        mode='server'
        columns={columns}
        rows={rows}
        pagination={{ currentPage: 1, pageSize: 10, totalItems: 20 }}
        loading
      />
    </MantineProvider>,
  );
  expect(screen.getByRole('table').textContent).toContain('Alice');
  expect(screen.getByRole('table').getAttribute('aria-busy')).toBe('true');
});

test('loaderProps reach the overlay loader and override its defaults', () => {
  const view = render(
    <MantineProvider env='test'>
      <DataTable columns={columns} rows={rows} loading />
    </MantineProvider>,
  );
  const loader = () =>
    view.container.querySelector('.mantine-Loader-root') as HTMLElement;
  // Default: Mantine's bars loader, small.
  expect(loader().classList.contains(Loader.classes.dotsLoader)).toBe(true);
  expect(loader().getAttribute('data-size')).toBe('md');
  view.rerender(
    <MantineProvider env='test'>
      <DataTable
        columns={columns}
        rows={rows}
        loading
        loaderProps={{ type: 'dots', size: 'lg', color: 'red' }}
      />
    </MantineProvider>,
  );
  expect(loader().classList.contains(Loader.classes.dotsLoader)).toBe(true);
  expect(loader().getAttribute('data-size')).toBe('lg');
});

test('an error replaces the rows and lets the caller retry', () => {
  const onRetry = vi.fn();
  const view = render(
    <MantineProvider env='test'>
      <DataTable
        mode='server'
        columns={columns}
        rows={rows}
        pagination={{ currentPage: 1, pageSize: 10, totalItems: 20 }}
        selection={{}}
        error='Request failed'
        onRetry={onRetry}
      />
    </MantineProvider>,
  );
  const alert = screen.getByRole('alert');
  // Icon, message and Retry, in one cell that spans the table.
  expect(alert.closest('td')?.getAttribute('colspan')).toBe('2');
  expect(alert.querySelector('svg')).toBeTruthy();
  expect(alert.textContent).toBe('Request failedRetry');
  expect(screen.getByRole('table').textContent).not.toContain('Alice');
  expect(screen.queryByText('No records found')).toBeNull();
  // No rows to select while the error shows.
  expect(
    (
      screen.getByRole('checkbox', {
        name: 'Select all rows on this page',
      }) as HTMLInputElement
    ).disabled,
  ).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(onRetry).toHaveBeenCalledTimes(1);

  view.rerender(
    <MantineProvider env='test'>
      <DataTable mode='server' columns={columns} rows={rows} error />
    </MantineProvider>,
  );
  expect(screen.getByRole('alert').textContent).toBe(
    'Something went wrong while loading the data.',
  );
  expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();

  view.rerender(
    <MantineProvider env='test'>
      <DataTable mode='server' columns={columns} rows={rows} />
    </MantineProvider>,
  );
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.getByRole('table').textContent).toContain('Alice');
});

test('page change sends the latest sort in the complete request', () => {
  const onChange = vi.fn();
  showServer({ currentPage: 3, pageSize: 10, totalItems: 40 }, onChange);
  expect(onChange).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Sort Name: none' }));
  fireEvent.click(screen.getByRole('button', { name: '2' }));
  expect(onChange).toHaveBeenCalledTimes(3);
  expect(onChange).toHaveBeenLastCalledWith({
    pagination: { currentPage: 2, pageSize: 10 },
    sorter: { field: 'name', order: 'asc' },
    filters: [],
    columnSearch: [],
    searchQuery: '',
  });
});

test('server pages render only supplied rows and trust the supplied total', () => {
  showServer({ currentPage: 2, pageSize: 10, totalItems: 100 });
  expect(screen.getAllByRole('row')).toHaveLength(3);
  expect(screen.getByText('Showing 11 - 20 of 100 items')).toBeTruthy();
});

test('server mode requests the initial state once on mount', () => {
  const onChange = vi.fn();
  render(
    <MantineProvider env='test'>
      <DataTable
        mode='server'
        columns={[
          {
            dataIndex: 'team',
            header: 'Team',
            filterable: true,
            filterOptions: ['Red', 'Blue'],
            defaultFilterValue: ['Red'],
          },
        ]}
        rows={people.slice(0, 5)}
        pagination={{ currentPage: 2, pageSize: 5, totalItems: 25 }}
        onChange={onChange}
      />
    </MantineProvider>,
  );
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith({
    pagination: { currentPage: 2, pageSize: 5 },
    sorter: undefined,
    filters: [{ field: 'team', value: ['Red'] }],
    columnSearch: [],
    searchQuery: '',
  });
});

test('client mode pages local rows and changes page size', () => {
  const onChange = vi.fn();
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={[{ dataIndex: 'name', header: 'Name' }]}
        rows={people}
        pagination
        onChange={onChange}
      />
    </MantineProvider>,
  );
  expect(names()).toHaveLength(10);
  expect(names()[0]).toBe('Person 01');
  expect(screen.getByText('Showing 1 - 10 of 25 items')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '3' }));
  expect(names()).toEqual([
    'Person 21',
    'Person 22',
    'Person 23',
    'Person 24',
    'Person 25',
  ]);
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({ pagination: { currentPage: 3, pageSize: 10 } }),
  );
  fireEvent.click(screen.getByRole('combobox', { name: 'Rows per page' }));
  fireEvent.click(screen.getByRole('option', { name: '20 / page' }));
  expect(names()).toHaveLength(20);
  expect(screen.getByText('Showing 1 - 20 of 25 items')).toBeTruthy();
});

test('client pagination starts from the configured page and size', () => {
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={[{ dataIndex: 'name', header: 'Name' }]}
        rows={people}
        pagination={{ currentPage: 2, pageSize: 5, pageSizeOptions: false }}
      />
    </MantineProvider>,
  );
  expect(names()[0]).toBe('Person 06');
  expect(screen.getByText('Showing 6 - 10 of 25 items')).toBeTruthy();
  expect(screen.queryByRole('combobox', { name: 'Rows per page' })).toBeNull();
});

test('client queries return to page one and count only matching rows', () => {
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={[
          { dataIndex: 'name', header: 'Name', sortable: true },
          {
            dataIndex: 'team',
            header: 'Team',
            filterable: true,
          },
        ]}
        rows={people}
        pagination
      />
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: '2' }));
  expect(names()[0]).toContain('Person 11');
  fireEvent.click(screen.getByRole('button', { name: 'Filter Team' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Red' }));
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
  expect(screen.getByText('Showing 1 - 10 of 13 items')).toBeTruthy();
  expect(names()[0]).toBe('Person 01Red');
  fireEvent.click(screen.getByRole('button', { name: 'Sort Name: none' }));
  fireEvent.click(screen.getByRole('button', { name: 'Sort Name: asc' }));
  expect(names()[0]).toBe('Person 25Red');
});

test('client pagination clamps when the rows shrink', () => {
  const view = render(
    <MantineProvider env='test'>
      <DataTable
        columns={[{ dataIndex: 'name', header: 'Name' }]}
        rows={people}
        pagination
      />
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: '3' }));
  view.rerender(
    <MantineProvider env='test'>
      <DataTable
        columns={[{ dataIndex: 'name', header: 'Name' }]}
        rows={people.slice(0, 12)}
        pagination
      />
    </MantineProvider>,
  );
  expect(screen.getByText('Showing 11 - 12 of 12 items')).toBeTruthy();
  expect(names()).toEqual(['Person 11', 'Person 12']);
});
