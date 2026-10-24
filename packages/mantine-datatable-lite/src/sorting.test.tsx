import { MantineProvider } from '@mantine/core';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { DataTable } from './components/DataTable';
import { sortRows } from './utils/sort/sortRows';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

test('header sort cycles ascending, descending, and original order', () => {
  const rows = [{ value: 10 }, { value: 2 }, { value: 5 }];
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={[
          {
            dataIndex: 'value',
            header: 'Value',
            type: 'number',
            sortable: true,
          },
        ]}
        rows={rows}
      />
    </MantineProvider>,
  );
  const button = screen.getByRole('button', { name: 'Sort Value: none' });
  const values = () =>
    within(screen.getByRole('table'))
      .getAllByRole('row')
      .slice(1)
      .map((row) => row.textContent);

  fireEvent.click(button);
  expect(values()).toEqual(['2', '5', '10']);
  expect(screen.getByRole('columnheader').getAttribute('aria-sort')).toBe(
    'ascending',
  );
  fireEvent.click(button);
  expect(values()).toEqual(['10', '5', '2']);
  expect(screen.getByRole('columnheader').getAttribute('aria-sort')).toBe(
    'descending',
  );
  fireEvent.click(button);
  expect(values()).toEqual(['10', '2', '5']);
  expect(screen.getByRole('columnheader').getAttribute('aria-sort')).toBe(
    'none',
  );
});

test('type-aware sorting keeps nulls last, stable ties, and honors custom sort', () => {
  const rows = [
    { name: 'éclair', score: null as number | null, group: 'aa' },
    { name: 'Apple', score: 2, group: 'b' },
    { name: 'banana', score: 2, group: 'c' },
  ];
  const score = [
    {
      dataIndex: 'score' as const,
      header: 'Score',
      sortable: true,
      type: 'number' as const,
    },
  ];
  expect(
    sortRows(rows, score, { field: 'score', order: 'asc' }).map(
      (row) => row.name,
    ),
  ).toEqual(['Apple', 'banana', 'éclair']);
  expect(
    sortRows(rows, score, { field: 'score', order: 'desc' }).map(
      (row) => row.name,
    ),
  ).toEqual(['Apple', 'banana', 'éclair']);
  expect(
    sortRows(
      rows,
      [{ dataIndex: 'name', header: 'Name', type: 'string', sortable: true }],
      { field: 'name', order: 'asc' },
    ).map((row) => row.name),
  ).toEqual(['Apple', 'banana', 'éclair']);
  expect(
    sortRows(
      rows,
      [
        {
          dataIndex: 'group',
          header: 'Group',
          sortable: true,
          sortFn: (a, b) => a.group.length - b.group.length,
        },
      ],
      { field: 'group', order: 'asc' },
    ).map((row) => row.name),
  ).toEqual(['Apple', 'banana', 'éclair']);
  expect(rows[0].name).toBe('éclair');
});

test('number, date, and boolean columns use their declared types', () => {
  const rows = [
    { number: '10', date: new Date('2024-12-01'), active: true },
    { number: '2', date: new Date('2023-01-01'), active: false },
  ];
  const columns = [
    {
      dataIndex: 'number',
      header: 'Number',
      type: 'number' as const,
      sortable: true,
    },
    {
      dataIndex: 'date',
      header: 'Date',
      type: 'date' as const,
      sortable: true,
    },
    {
      dataIndex: 'active',
      header: 'Active',
      type: 'boolean' as const,
      sortable: true,
    },
  ];
  expect(
    sortRows(rows, columns, { field: 'number', order: 'asc' })[0],
  ).toBe(rows[1]);
  expect(
    sortRows(rows, columns, { field: 'date', order: 'asc' })[0],
  ).toBe(rows[1]);
  expect(
    sortRows(rows, columns, { field: 'active', order: 'asc' })[0],
  ).toBe(rows[1]);
  expect(
    sortRows(rows, columns, { field: 'active', order: 'desc' })[0],
  ).toBe(rows[0]);
});

test('server rows stay untouched and every sort click is requested immediately', () => {
  const onChange = vi.fn();
  render(
    <MantineProvider env='test'>
      <DataTable
        mode='server'
        columns={[
          {
            dataIndex: 'value',
            header: 'Value',
            sortable: true,
            defaultSortOrder: 'asc',
          },
        ]}
        rows={[{ value: 2 }, { value: 1 }]}
        pagination={{ currentPage: 1, pageSize: 2, totalItems: 10 }}
        onChange={onChange}
      />
    </MantineProvider>,
  );
  const request = (sorter?: { field: string; order: 'asc' | 'desc' }) => ({
    pagination: { currentPage: 1, pageSize: 2 },
    sorter,
    filters: [],
    columnSearch: [],
    searchQuery: '',
  });
  // The initial request carries the column default.
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenLastCalledWith(
    request({ field: 'value', order: 'asc' }),
  );
  const button = screen.getByRole('button', { name: 'Sort Value: asc' });
  fireEvent.click(button);
  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenLastCalledWith(
    request({ field: 'value', order: 'desc' }),
  );
  fireEvent.click(button);
  expect(onChange).toHaveBeenCalledTimes(3);
  expect(onChange).toHaveBeenLastCalledWith(request(undefined));
  expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual([
    '2',
    '1',
  ]);
});

test('client mode does not report the initial state', () => {
  const onChange = vi.fn();
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={[
          {
            dataIndex: 'value',
            header: 'Value',
            sortable: true,
            defaultSortOrder: 'asc',
          },
        ]}
        rows={[{ value: 2 }, { value: 1 }]}
        onChange={onChange}
      />
    </MantineProvider>,
  );
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual([
    '1',
    '2',
  ]);
});

test('sort submenu selects a direction', async () => {
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={[
          {
            dataIndex: 'value',
            header: 'Value',
            sortable: true,
            showMenu: true,
          },
        ]}
        rows={[{ value: 2 }, { value: 1 }]}
      />
    </MantineProvider>,
  );
  // With a menu, the header sort button is hidden unless showSortIcon is set.
  expect(screen.queryByRole('button', { name: 'Sort Value: none' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Value menu' }));
  for (const label of ['Filter', 'Search', 'Pin', 'Hide']) {
    expect(screen.getByRole('menuitem', { name: label })).toBeTruthy();
  }
  fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Sort' }));
  fireEvent.click(
    await screen.findByRole('menuitem', { name: 'Sort Descending' }),
  );
  expect(screen.getByRole('columnheader').getAttribute('aria-sort')).toBe(
    'descending',
  );
});

test('showSortIcon brings the header button back next to the menu', () => {
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={[
          {
            dataIndex: 'value',
            header: 'Value',
            sortable: true,
            showMenu: true,
            showSortIcon: true,
          },
        ]}
        rows={[{ value: 2 }]}
      />
    </MantineProvider>,
  );
  expect(screen.getByRole('button', { name: 'Sort Value: none' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Value menu' })).toBeTruthy();
});

test('showMenu displays only requested actions even when sorting is disabled', () => {
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={[
          {
            dataIndex: 'value',
            header: 'Value',
            showMenu: true,
            menuOptions: ['filter', 'display'],
          },
        ]}
        rows={[]}
      />
    </MantineProvider>,
  );
  expect(screen.queryByRole('button', { name: 'Sort Value: none' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Value menu' }));
  expect(screen.getByRole('menuitem', { name: 'Filter' })).toBeTruthy();
  expect(screen.getByRole('menuitem', { name: 'Hide' })).toBeTruthy();
  expect(screen.queryByRole('menuitem', { name: 'Sort' })).toBeNull();
});
