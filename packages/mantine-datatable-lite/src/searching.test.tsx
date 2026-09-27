import { MantineProvider } from '@mantine/core';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { DataTable } from './components/DataTable';
import { searchRows } from './utils/search/searchRows';

afterEach(() => { cleanup(); vi.useRealTimers(); });

test('raw value search combines column AND global terms and excludes explicit global opt-outs', () => {
  const rows = [
    { name: 'Alice', city: 'New York', secret: 'match' },
    { name: 'Bob', city: 'York', secret: 'match' },
    { name: 'Alice', city: 'Paris', secret: 'other' },
  ];
  const columns = [
    { dataIndex: 'name', header: 'Name', searchable: true },
    { dataIndex: 'city', header: 'City' },
    { dataIndex: 'secret', header: 'Secret', searchable: false },
  ];
  expect(searchRows(rows, columns, [{ searchField: 'name', searchValue: 'alice' }], 'YORK')).toEqual([rows[0]]);
  expect(searchRows(rows, columns, [], 'match')).toEqual([]);
  expect(searchRows(rows, columns, [], 'york')).toEqual([rows[0], rows[1]]);
});

test('column search is opt-in; icon and menu share Apply and Reset', async () => {
  const onChange = vi.fn();
  render(<MantineProvider env='test'><DataTable rows={[{ name: 'Alice', city: 'York' }, { name: 'Bob', city: 'Paris' }]}
    columns={[{ dataIndex: 'name', header: 'Name', searchable: true, showMenu: true },
      { dataIndex: 'city', header: 'City', showMenu: true }]} onChange={onChange} /></MantineProvider>);
  expect(screen.queryByRole('button', { name: 'Search City' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Name menu' }));
  fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Search' }));
  const input = await screen.findByRole('textbox', { name: 'Search Name' });
  fireEvent.change(input, { target: { value: 'ali' } });
  expect(within(screen.getByRole('table')).getAllByRole('cell')).toHaveLength(4);
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
  expect(within(screen.getByRole('table')).getAllByRole('cell')).toHaveLength(2);
  expect(screen.getByRole('mark').textContent?.toLowerCase()).toBe('ali');
  fireEvent.click(screen.getByRole('button', { name: 'Search Name' }));
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(within(screen.getByRole('table')).getAllByRole('cell')).toHaveLength(4);
  expect(onChange).not.toHaveBeenCalled();
});

test('default search is applied and externally owned rows are not transformed', () => {
  const columns = [{ dataIndex: 'name' as const, header: 'Name', searchable: true, defaultSearchValue: 'Ali' }];
  const rows = [{ name: 'Alice' }, { name: 'Bob' }];
  const view = render(<MantineProvider env='test'><DataTable columns={columns} rows={rows} /></MantineProvider>);
  expect(screen.getAllByRole('cell')).toHaveLength(1);
  view.rerender(<MantineProvider env='test'><DataTable columns={columns} rows={rows}
    pagination={{ currentPage: 1, pageSize: 2, totalItems: 4 }} /></MantineProvider>);
  expect(screen.getAllByRole('cell')).toHaveLength(2);
});

test('global search debounces, retains a filled input on blur, and Escape clears', () => {
  vi.useFakeTimers();
  const onChange = vi.fn();
  render(<MantineProvider env='test'><DataTable columns={[{ dataIndex: 'name', header: 'Name' }]}
    rows={[{ name: 'Alice' }, { name: 'Bob' }]} globalSearch onChange={onChange} /></MantineProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Open global search' }));
  const input = screen.getByRole('textbox', { name: 'Search all columns' });
  fireEvent.change(input, { target: { value: 'ali' } });
  act(() => vi.advanceTimersByTime(299));
  expect(screen.getAllByRole('cell')).toHaveLength(2);
  expect(onChange).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getAllByRole('cell')).toHaveLength(1);
  expect(onChange).toHaveBeenCalledWith({ pagination: undefined, sorter: undefined, filters: [], columnSearch: [], searchQuery: 'ali' });
  fireEvent.blur(input);
  expect(screen.getByRole('textbox', { name: 'Search all columns' })).toBeTruthy();
  fireEvent.keyDown(input, { key: 'Escape' });
  expect(screen.queryByRole('textbox', { name: 'Search all columns' })).toBeNull();
  expect(screen.getAllByRole('cell')).toHaveLength(2);
  expect(onChange).toHaveBeenLastCalledWith({ pagination: undefined, sorter: undefined, filters: [], columnSearch: [], searchQuery: '' });
});

test('empty global input collapses on blur and Escape cancels a pending query', () => {
  vi.useFakeTimers();
  const onChange = vi.fn();
  render(<MantineProvider env='test'><DataTable columns={[{ dataIndex: 'name', header: 'Name' }]}
    rows={[{ name: 'Alice' }, { name: 'Bob' }]} globalSearch onChange={onChange} /></MantineProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Open global search' }));
  fireEvent.blur(screen.getByRole('textbox', { name: 'Search all columns' }));
  expect(screen.queryByRole('textbox', { name: 'Search all columns' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Open global search' }));
  const input = screen.getByRole('textbox', { name: 'Search all columns' });
  fireEvent.change(input, { target: { value: 'alice' } });
  fireEvent.keyDown(input, { key: 'Escape' });
  act(() => vi.advanceTimersByTime(300));
  expect(screen.getAllByRole('cell')).toHaveLength(2);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenLastCalledWith({ pagination: undefined, sorter: undefined, filters: [], columnSearch: [], searchQuery: '' });
});
