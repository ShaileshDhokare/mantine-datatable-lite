import { MantineProvider } from '@mantine/core';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { DataTable } from './components/DataTable';
import { AppliedChips } from './components/toolbar/AppliedChips';
import { describeState, type StatePill } from './utils/describeState';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function pill(label: string) {
  return screen.getByRole('button', { name: `Remove ${label}` })
    .parentElement as HTMLElement;
}

test('toolbar controls and pills are opt in', () => {
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={[{ dataIndex: 'name', header: 'Name' }]}
        rows={[{ name: 'Ava' }]}
      />
    </MantineProvider>,
  );
  expect(screen.queryByRole('button', { name: 'Select columns' })).toBeNull();
  expect(
    screen.queryByRole('button', { name: 'Reset table state' }),
  ).toBeNull();
  expect(
    screen.queryByRole('button', { name: 'Open global search' }),
  ).toBeNull();
});

test('filter pills label each choice and remove only one value', () => {
  const rows = [{ department: 'IT' }, { department: 'Support' }];
  render(
    <MantineProvider env='test'>
      <DataTable
        rows={rows}
        showTableStatePills
        columns={[
          {
            dataIndex: 'department',
            header: 'Department',
            filterable: true,
            defaultFilterValue: ['IT', 'Support'],
          },
        ]}
      />
    </MantineProvider>,
  );
  expect(pill('Department: IT').textContent).toBe('Department: IT');
  expect(pill('Department: Support').textContent).toBe('Department: Support');
  fireEvent.click(
    screen.getByRole('button', { name: 'Remove Department: IT' }),
  );
  expect(
    screen.queryByRole('button', { name: 'Remove Department: IT' }),
  ).toBeNull();
  expect(pill('Department: Support')).toBeTruthy();
  expect(within(screen.getByRole('table')).getAllByRole('cell')).toHaveLength(
    1,
  );
});

test('picker stages visibility and hidden pill restores a column', () => {
  const columns = [
    { dataIndex: 'name', header: 'Name', showMenu: true },
    { dataIndex: 'age', header: 'Age', showMenu: true },
  ];
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={columns}
        rows={[{ name: 'Ava', age: 24 }]}
        columnSelector
        showTableStatePills
      />
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Select columns' }));
  expect(
    (screen.getByRole('checkbox', { name: 'Name' }) as HTMLInputElement)
      .checked,
  ).toBe(true);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Age' }));
  expect(screen.getAllByRole('columnheader')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
  expect(screen.getAllByRole('columnheader')).toHaveLength(1);
  expect(pill('Hidden: Age')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Remove Hidden: Age' }));
  expect(screen.getAllByRole('columnheader')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Name menu' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Hide' }));
  expect(pill('Hidden: Name')).toBeTruthy();
});

test('picker and menu keep non-hideable columns visible and disable the last visible column', () => {
  const columns = [
    { dataIndex: 'name', header: 'Name', showMenu: true },
    {
      dataIndex: 'actions',
      header: 'Actions',
      showMenu: true,
      hideable: false,
    },
  ];
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={columns}
        rows={[{ name: 'Ava', actions: 'Edit' }]}
        columnSelector
      />
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Select columns' }));
  expect(
    (screen.getByRole('checkbox', { name: 'Actions' }) as HTMLInputElement)
      .disabled,
  ).toBe(true);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Name' }));
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
  expect(screen.getAllByRole('columnheader')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Select columns' }));
  expect(
    (screen.getByRole('checkbox', { name: 'Actions' }) as HTMLInputElement)
      .disabled,
  ).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Actions menu' }));
  expect(
    screen
      .getByRole('menuitem', { name: 'Hide' })
      .getAttribute('data-disabled'),
  ).not.toBeNull();
});

test('reset clears sorter, filters, searches and hidden columns in one state update', () => {
  vi.useFakeTimers();
  const onChange = vi.fn();
  render(
    <MantineProvider env='test'>
      <DataTable
        rows={[{ name: 'Ava', department: 'IT' }]}
        columns={[
          {
            dataIndex: 'name',
            header: 'Name',
            sortable: true,
            searchable: true,
            defaultSortOrder: 'desc',
            defaultSearchValue: 'Av',
          },
          {
            dataIndex: 'department',
            header: 'Department',
            filterable: true,
            defaultFilterValue: ['IT'],
          },
        ]}
        showTableStatePills
        showReset
        columnSelector
        onChange={onChange}
      />
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Select columns' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Department' }));
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
  fireEvent.click(screen.getByRole('button', { name: 'Reset table state' }));
  expect(screen.getAllByRole('columnheader')).toHaveLength(2);
  expect(
    screen.queryByRole('button', { name: 'Remove Hidden: Department' }),
  ).toBeNull();
  expect(
    screen.queryByRole('button', { name: 'Remove Sort by: Name DESC' }),
  ).toBeNull();
  expect(
    screen.queryByRole('button', { name: 'Remove Department: IT' }),
  ).toBeNull();
  expect(
    screen.queryByRole('button', { name: 'Remove Name: %Av%' }),
  ).toBeNull();
  act(() => vi.advanceTimersByTime(300));
  expect(onChange).toHaveBeenLastCalledWith({
    pagination: undefined,
    sorter: undefined,
    filters: [],
    columnSearch: [],
    searchQuery: '',
  });
});

test('describeState labels numeric and date filter shapes', () => {
  const columns = [
    { dataIndex: 'age', header: 'Age' },
    { dataIndex: 'joined', header: 'Joined' },
    {
      dataIndex: 'active',
      header: 'Status',
      filterOptions: [{ value: 'true', label: 'Active' }],
    },
  ];
  const noop = vi.fn();
  const pills = describeState(columns, {
    filters: [
      { field: 'age', value: { operator: 'between', value: [20, 30] } },
      {
        field: 'joined',
        value: { operator: 'gte', value: new Date(2024, 0, 1) },
      },
      { field: 'active', value: [true] },
    ],
    columnSearch: [],
    searchQuery: '',
    hiddenColumns: [],
    setSort: noop,
    setFilter: noop,
    setColumnSearch: noop,
    setSearchQuery: noop,
    setColumnHidden: noop,
  });
  expect(pills[0].label).toBe('Age: between 20 and 30');
  expect(pills[1].label).toContain('Joined: ≥ ');
  expect(pills[2].label).toBe('Status: Active');
});

test('maxChips places overflow pills in a popover', () => {
  render(
    <MantineProvider env='test'>
      <DataTable
        rows={[{ name: 'Ava', department: 'IT' }]}
        columns={[
          {
            dataIndex: 'name',
            header: 'Name',
            sortable: true,
            defaultSortOrder: 'asc',
          },
          {
            dataIndex: 'department',
            header: 'Department',
            filterable: true,
            defaultFilterValue: ['IT'],
          },
        ]}
        showTableStatePills
        maxChips={1}
      />
    </MantineProvider>,
  );
  expect(pill('Sort by: Name ASC')).toBeTruthy();
  expect(screen.getByRole('button', { name: '+1 more' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '+1 more' }));
  expect(pill('Department: IT')).toBeTruthy();
});

test('reset cancels pending global search input', () => {
  vi.useFakeTimers();
  const onChange = vi.fn();
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={[{ dataIndex: 'name', header: 'Name' }]}
        rows={[{ name: 'Ava' }, { name: 'Ben' }]}
        globalSearch
        showReset
        onChange={onChange}
      />
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open global search' }));
  fireEvent.change(
    screen.getByRole('textbox', { name: 'Search all columns' }),
    { target: { value: 'Ava' } },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Reset table state' }));
  act(() => vi.advanceTimersByTime(300));
  expect(screen.getAllByRole('cell')).toHaveLength(2);
  expect(
    (
      screen.getByRole('textbox', {
        name: 'Search all columns',
      }) as HTMLInputElement
    ).value,
  ).toBe('');
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenLastCalledWith({
    pagination: undefined,
    sorter: undefined,
    filters: [],
    columnSearch: [],
    searchQuery: '',
  });
});

test('sort and column search pills clear only their own state', () => {
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={[
          {
            dataIndex: 'name',
            header: 'Name',
            sortable: true,
            defaultSortOrder: 'desc',
            searchable: true,
            defaultSearchValue: 'Av',
          },
        ]}
        rows={[{ name: 'Ava' }, { name: 'Ben' }]}
        showTableStatePills
      />
    </MantineProvider>,
  );
  expect(pill('Sort by: Name DESC')).toBeTruthy();
  expect(pill('Name: %Av%')).toBeTruthy();
  fireEvent.click(
    screen.getByRole('button', { name: 'Remove Sort by: Name DESC' }),
  );
  expect(pill('Name: %Av%')).toBeTruthy();
  expect(screen.getAllByRole('cell')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Remove Name: %Av%' }));
  expect(screen.getAllByRole('cell')).toHaveLength(2);
});

test('global search clear action clears the applied query and pill', () => {
  vi.useFakeTimers();
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={[{ dataIndex: 'name', header: 'Name' }]}
        rows={[{ name: 'Ava' }, { name: 'Ben' }]}
        globalSearch
        showTableStatePills
      />
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open global search' }));
  fireEvent.change(
    screen.getByRole('textbox', { name: 'Search all columns' }),
    { target: { value: 'Ava' } },
  );
  act(() => vi.advanceTimersByTime(300));
  expect(pill('Search: %Ava%')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Clear global search' }));
  expect(
    screen.queryByRole('button', { name: 'Remove Search: %Ava%' }),
  ).toBeNull();
  expect(screen.getAllByRole('cell')).toHaveLength(2);
});

test('all pills use gray.3 and emphasize labels and search terms', () => {
  const remove = vi.fn();
  const pills: StatePill[] = [
    {
      key: 'sort',
      label: 'Sort by: Age DESC',
      fieldLabel: 'Sort by:',
      value: 'Age DESC',
      remove,
    },
    {
      key: 'filter',
      label: 'Department: IT',
      fieldLabel: 'Department:',
      value: 'IT',
      remove,
    },
    {
      key: 'search',
      label: 'Name: %Ava%',
      fieldLabel: 'Name:',
      value: 'Ava',
      emphasizeValue: true,
      remove,
    },
    {
      key: 'global',
      label: 'Search: %Ava%',
      fieldLabel: 'Search:',
      value: 'Ava',
      emphasizeValue: true,
      remove,
    },
    {
      key: 'hidden',
      label: 'Hidden: Age',
      fieldLabel: 'Hidden:',
      value: 'Age',
      remove,
    },
  ];
  render(
    <MantineProvider env='test'>
      <AppliedChips pills={pills} />
    </MantineProvider>,
  );
  for (const item of pills) {
    expect(pill(item.label).style.background).toBe(
      'var(--mantine-color-gray-3)',
    );
  }
  expect(pill('Name: %Ava%').textContent).toBe('Name: %Ava%');
  const emphasized = pill('Name: %Ava%').querySelectorAll('.mantine-Text-root');
  expect([...emphasized].map((node) => node.textContent)).toEqual([
    'Name:',
    'Ava',
  ]);
  expect(
    [...emphasized].every(
      (node) => (node as HTMLElement).style.fontWeight === '500',
    ),
  ).toBe(true);
  expect(
    pill('Sort by: Age DESC').querySelector('.mantine-Text-root')?.textContent,
  ).toBe('Sort by:');
  expect(
    pill('Department: IT').querySelector('.mantine-Text-root')?.textContent,
  ).toBe('Department:');
});
