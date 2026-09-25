import { MantineProvider } from '@mantine/core';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { DataTable } from './components/DataTable';
import { sortRows } from './utils/sortRows';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

test('header sort cycles ascending, descending, and original order', () => {
  const rows = [{ value: 10 }, { value: 2 }, { value: 5 }];
  render(<MantineProvider env='test'><DataTable columns={[{ dataIndex: 'value', header: 'Value', type: 'number', sortable: true }]} rows={rows} /></MantineProvider>);
  const button = screen.getByRole('button', { name: 'Sort Value: none' });
  const values = () => within(screen.getByRole('table')).getAllByRole('row').slice(1).map((row) => row.textContent);

  fireEvent.click(button);
  expect(values()).toEqual(['2', '5', '10']);
  expect(screen.getByRole('columnheader').getAttribute('aria-sort')).toBe('ascending');
  fireEvent.click(button);
  expect(values()).toEqual(['10', '5', '2']);
  expect(screen.getByRole('columnheader').getAttribute('aria-sort')).toBe('descending');
  fireEvent.click(button);
  expect(values()).toEqual(['10', '2', '5']);
  expect(screen.getByRole('columnheader').getAttribute('aria-sort')).toBe('none');
});

test('type-aware sorting keeps nulls last, stable ties, and honors custom sort', () => {
  const rows = [
    { name: 'éclair', score: null as number | null, group: 'aa' },
    { name: 'Apple', score: 2, group: 'b' },
    { name: 'banana', score: 2, group: 'c' },
  ];
  const score = [{ dataIndex: 'score' as const, header: 'Score', sortable: true, type: 'number' as const }];
  expect(sortRows(rows, score, { sortField: 'score', sortOrder: 'asc' }).map((row) => row.name)).toEqual(['Apple', 'banana', 'éclair']);
  expect(sortRows(rows, score, { sortField: 'score', sortOrder: 'desc' }).map((row) => row.name)).toEqual(['Apple', 'banana', 'éclair']);
  expect(sortRows(rows, [{ dataIndex: 'name', header: 'Name', type: 'string', sortable: true }], { sortField: 'name', sortOrder: 'asc' }).map((row) => row.name)).toEqual(['Apple', 'banana', 'éclair']);
  expect(sortRows(rows, [{ dataIndex: 'group', header: 'Group', sortable: true, sortFn: (a, b) => a.group.length - b.group.length }], { sortField: 'group', sortOrder: 'asc' }).map((row) => row.name)).toEqual(['Apple', 'banana', 'éclair']);
  expect(rows[0].name).toBe('éclair');
});

test('number, date, and boolean columns use their declared types', () => {
  const rows = [
    { number: '10', date: new Date('2024-12-01'), active: true },
    { number: '2', date: new Date('2023-01-01'), active: false },
  ];
  const columns = [
    { dataIndex: 'number', header: 'Number', type: 'number' as const, sortable: true },
    { dataIndex: 'date', header: 'Date', type: 'date' as const, sortable: true },
    { dataIndex: 'active', header: 'Active', type: 'boolean' as const, sortable: true },
  ];
  expect(sortRows(rows, columns, { sortField: 'number', sortOrder: 'asc' })[0]).toBe(rows[1]);
  expect(sortRows(rows, columns, { sortField: 'date', sortOrder: 'asc' })[0]).toBe(rows[1]);
  expect(sortRows(rows, columns, { sortField: 'active', sortOrder: 'asc' })[0]).toBe(rows[1]);
  expect(sortRows(rows, columns, { sortField: 'active', sortOrder: 'desc' })[0]).toBe(rows[0]);
});

test('pagination-owned rows stay untouched and the latest request is debounced', () => {
  vi.useFakeTimers();
  const onChange = vi.fn();
  const pagination = { currentPage: 1, pageSize: 2, totalItems: 10 };
  render(<MantineProvider env='test'><DataTable columns={[{ dataIndex: 'value', header: 'Value', sortable: true }]} rows={[{ value: 2 }, { value: 1 }]} pagination={pagination} onChange={onChange} /></MantineProvider>);
  const button = screen.getByRole('button', { name: 'Sort Value: none' });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['2', '1']);
  act(() => vi.advanceTimersByTime(300));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith({ pagination, sorter: { sortField: 'value', sortOrder: 'desc' } });
});

test('sort submenu selects a direction', async () => {
  render(<MantineProvider env='test'><DataTable columns={[{ dataIndex: 'value', header: 'Value', sortable: true, showMenu: true }]} rows={[{ value: 2 }, { value: 1 }]} /></MantineProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Value menu' }));
  for (const label of ['Filter', 'Search', 'Pin', 'Display']) {
    expect(screen.getByRole('menuitem', { name: label })).toBeTruthy();
  }
  fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Sort' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Sort Descending' }));
  expect(screen.getByRole('columnheader').getAttribute('aria-sort')).toBe('descending');
});

test('showMenu displays only requested actions even when sorting is disabled', () => {
  render(<MantineProvider env='test'><DataTable columns={[{ dataIndex: 'value', header: 'Value', showMenu: true, menuOptions: ['filter', 'display'] }]} rows={[]} /></MantineProvider>);
  expect(screen.queryByRole('button', { name: 'Sort Value: none' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Value menu' }));
  expect(screen.getByRole('menuitem', { name: 'Filter' })).toBeTruthy();
  expect(screen.getByRole('menuitem', { name: 'Display' })).toBeTruthy();
  expect(screen.queryByRole('menuitem', { name: 'Sort' })).toBeNull();
});
