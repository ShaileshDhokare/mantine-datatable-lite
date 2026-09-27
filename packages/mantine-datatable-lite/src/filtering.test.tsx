import { MantineProvider } from '@mantine/core';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { DataTable } from './components/DataTable';
import type { NumericOperator } from './types';
import { filterRows, matchesFilter } from './utils/filter/predicates';
import { uniqueValues } from './utils/filter/uniqueValues';

afterEach(() => { cleanup(); vi.useRealTimers(); });

test.each([
  ['eq', 5, [5]], ['neq', 5, [3, 7]], ['gt', 5, [7]],
  ['gte', 5, [5, 7]], ['lt', 5, [3]], ['lte', 5, [3, 5]],
  ['between', [7, 3], [3, 5, 7]],
] as [NumericOperator, number | [number, number], number[]][])(
  '%s number operator matches expected values', (operator, value, expected) => {
    expect([3, 5, 7].filter((item) => matchesFilter(item, { operator, value }, 'number'))).toEqual(expected);
  },
);

test('date comparison uses calendar days and normalizes reversed bounds', () => {
  const value = { operator: 'between' as const, value: [new Date('2024-01-03'), new Date('2024-01-01')] as [Date, Date] };
  expect(matchesFilter(new Date('2024-01-02T23:00:00'), value, 'date')).toBe(true);
  expect(matchesFilter(new Date('2024-01-04'), value, 'date')).toBe(false);
  expect(matchesFilter(new Date('invalid'), value, 'date')).toBe(false);
});

test('incomplete filters do nothing; active filters exclude null and invalid values', () => {
  expect(matchesFilter(null, { operator: 'eq', value: null } as never, 'number')).toBe(true);
  expect(matchesFilter(3, { operator: 'between', value: [3, null] } as never, 'number')).toBe(true);
  expect(matchesFilter(null, { operator: 'gt', value: 1 }, 'number')).toBe(false);
  expect(matchesFilter('oops', { operator: 'gt', value: 1 }, 'number')).toBe(false);
  expect(matchesFilter('5', { operator: 'eq', value: 5 }, 'number')).toBe(true);
  expect(matchesFilter(undefined, ['London'], 'string')).toBe(false);
});

test('several column filters use AND and custom predicates', () => {
  const rows = [
    { city: 'London', age: 20, active: true },
    { city: 'London', age: 30, active: false },
    { city: 'Paris', age: 20, active: true },
  ];
  const columns = [
    { dataIndex: 'city', header: 'City', filterable: true },
    { dataIndex: 'age', header: 'Age', type: 'number' as const, filterable: true },
    { dataIndex: 'active', header: 'Active', filterable: true, filterFn: (row: typeof rows[number], value: unknown) =>
      row.active === (value as boolean[])[0] },
  ];
  expect(filterRows(rows, columns, [
    { field: 'city', value: ['London'] },
    { field: 'age', value: { operator: 'lte', value: 25 } },
    { field: 'active', value: [true] },
  ])).toEqual([rows[0]]);
});

test('derived choices are unique, naturally ordered, sentence cased and capped', () => {
  const column = { dataIndex: 'city', header: 'City', filterable: true };
  expect(uniqueValues([{ city: 'new_york' }, { city: 'london' }, { city: 'new_york' }, { city: null }], column))
    .toEqual([{ value: 'london', label: 'London' }, { value: 'new_york', label: 'New york' }]);
  expect(uniqueValues(Array.from({ length: 600 }, (_, city) => ({ city: String(city) })), column)).toHaveLength(500);
});

test('default string filter renders; Apply and Reset notify with the full state', () => {
  vi.useFakeTimers();
  const onChange = vi.fn();
  const rows = [{ city: 'London' }, { city: 'Paris' }, { city: 'London' }];
  render(<MantineProvider env='test'><DataTable
    columns={[{ dataIndex: 'city', header: 'City', filterable: true, defaultFilterValue: ['London'], showMenu: true }]}
    rows={rows} onChange={onChange} /></MantineProvider>);
  expect(screen.getAllByRole('cell')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Filter City' }));
  expect((screen.getByRole('checkbox', { name: 'London' }) as HTMLInputElement).checked).toBe(true);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Paris' }));
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
  expect(screen.getAllByRole('cell')).toHaveLength(3);
  act(() => vi.advanceTimersByTime(300));
  expect(onChange).toHaveBeenLastCalledWith({ pagination: undefined, sorter: undefined, filters: [{ field: 'city', value: ['London', 'Paris'] }] });
  fireEvent.click(screen.getByRole('button', { name: 'City menu' }));
  fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Filter' }));
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(screen.getAllByRole('cell')).toHaveLength(3);
  act(() => vi.advanceTimersByTime(300));
  expect(onChange).toHaveBeenLastCalledWith({ pagination: undefined, sorter: undefined, filters: [] });
});

test('explicit option search narrows checkboxes without filtering rows before Apply', () => {
  render(<MantineProvider env='test'><DataTable columns={[{ dataIndex: 'city', header: 'City', filterable: true, searchableFilter: true }]}
    rows={[{ city: 'London' }, { city: 'Paris' }]} /></MantineProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Filter City' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Search in filters' }), { target: { value: 'Lon' } });
  expect(screen.getByRole('checkbox', { name: 'London' })).toBeTruthy();
  expect(screen.queryByRole('checkbox', { name: 'Paris' })).toBeNull();
  expect(within(screen.getByRole('table')).getAllByRole('cell')).toHaveLength(2);
});

test('option search is absent by default', () => {
  render(<MantineProvider env='test'><DataTable columns={[{
    dataIndex: 'city', header: 'City', filterable: true,
    filterOptions: [{ value: 'London', label: 'London' }],
  }]} rows={[{ city: 'London' }]} /></MantineProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Filter City' }));
  expect(screen.queryByRole('textbox', { name: 'Search in filters' })).toBeNull();
  expect(screen.getByRole('checkbox', { name: 'London' })).toBeTruthy();
});

test('empty result displays the default state and accepts custom content', () => {
  const columns = [{ dataIndex: 'city' as const, header: 'City', filterable: true, defaultFilterValue: ['Paris'] }];
  const rows = [{ city: 'London' }];
  const view = render(<MantineProvider env='test'><DataTable columns={columns} rows={rows} /></MantineProvider>);
  expect(screen.getByText('No records found')).toBeTruthy();
  expect(screen.getByRole('table').querySelector('svg')).toBeTruthy();
  expect(screen.getByRole('cell').getAttribute('colspan')).toBe('1');
  view.rerender(<MantineProvider env='test'><DataTable columns={columns} rows={rows}
    emptyState={<span>Nothing in this view</span>} /></MantineProvider>);
  expect(screen.getByText('Nothing in this view')).toBeTruthy();
  expect(screen.queryByText('No records found')).toBeNull();
});

test.each([
  { type: 'string' as const, row: { value: 'London' }, option: 'London' },
  { type: 'boolean' as const, row: { value: true }, option: 'True' },
])('menu-only $type column shows choices in its submenu', async ({ type, row, option }) => {
  render(<MantineProvider env='test'><DataTable columns={[{
    dataIndex: 'value', header: 'Value', type, filterable: true,
    sortable: true, showMenu: true, showSortIcon: false, showFilterIcon: false,
  }]} rows={[row]} /></MantineProvider>);
  expect(screen.queryByRole('button', { name: 'Filter Value' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Sort Value: none' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Value menu' }));
  fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Filter' }));
  expect(await screen.findByRole('checkbox', { name: option })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Apply' })).toBeTruthy();
});

test.each([
  { type: 'number' as const, row: { value: 20 } },
  { type: 'date' as const, row: { value: new Date('2024-01-01') } },
])('menu-only $type column shows operator controls in its submenu', async ({ type, row }) => {
  render(<MantineProvider env='test'><DataTable columns={[{
    dataIndex: 'value', header: 'Value', type, filterable: true,
    showMenu: true, showFilterIcon: false,
  }]} rows={[row]} /></MantineProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Value menu' }));
  fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Filter' }));
  expect(await screen.findByRole('combobox')).toBeTruthy();
  expect(type === 'date' ? screen.getByRole('button', { name: 'Value' }) : screen.getByPlaceholderText('Value')).toBeTruthy();
});

test('choosing Between keeps the filter open and shows both number bounds', async () => {
  render(<MantineProvider env='test'><DataTable columns={[{
    dataIndex: 'age', header: 'Age', type: 'number', filterable: true,
  }]} rows={[{ age: 20 }]} /></MantineProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Filter Age' }));
  fireEvent.click(screen.getByRole('combobox'));
  fireEvent.click(await screen.findByRole('option', { name: 'Between' }));
  expect(screen.getByRole('button', { name: 'Apply' })).toBeTruthy();
  expect(screen.getByPlaceholderText('From')).toBeTruthy();
  expect(screen.getByPlaceholderText('To')).toBeTruthy();
});
