import { MantineProvider } from '@mantine/core';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { useState } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { DataTable } from './components/DataTable';
import type { DataTableColumn, TableChange } from './types';
import { sortRows } from './utils/sort/sortRows';

const defaultObserver = globalThis.ResizeObserver;
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  globalThis.ResizeObserver = defaultObserver;
});

test('loading preserves table DOM, cell state and observed headers; wrapping reconnects observation', () => {
  const observed: Element[] = [];
  globalThis.ResizeObserver = class {
    observe(element: Element) {
      observed.push(element);
    }
    unobserve() {}
    disconnect() {}
  };
  const columns = [
    {
      dataIndex: 'name',
      header: 'Name',
      sticky: 'left' as const,
      render: () => <input aria-label='Cell draft' defaultValue='initial' />,
    },
  ];
  const rows = [{ id: 1, name: 'Ava' }];
  const view = render(
    <MantineProvider env='test'>
      <DataTable columns={columns} rows={rows} />
    </MantineProvider>,
  );
  const table = screen.getByRole('table');
  const header = screen.getByRole('columnheader');
  fireEvent.change(screen.getByRole('textbox', { name: 'Cell draft' }), {
    target: { value: 'edited' },
  });
  for (const loading of [true, false]) {
    view.rerender(
      <MantineProvider env='test'>
        <DataTable columns={columns} rows={rows} loading={loading} />
      </MantineProvider>,
    );
    expect(screen.getByRole('table')).toBe(table);
    expect(
      (screen.getByRole('textbox', { name: 'Cell draft' }) as HTMLInputElement)
        .value,
    ).toBe('edited');
    expect(table.getAttribute('aria-busy')).toBe(String(loading));
    expect(observed).toContain(header);
  }
  view.rerender(
    <MantineProvider env='test'>
      <DataTable columns={columns} rows={rows} minWidth={500} />
    </MantineProvider>,
  );
  expect(observed).toContain(screen.getByRole('columnheader'));
});

test.each(['asc', 'desc'] as const)(
  'invalid numeric/date values stay last in %s sorting',
  (sortOrder) => {
    const numeric = [
      { value: 3 },
      { value: NaN },
      { value: 1 },
      { value: 'invalid' },
      { value: null },
    ];
    const numbers = sortRows(
      numeric,
      [{ dataIndex: 'value', header: 'Value', type: 'number', sortable: true }],
      { sortField: 'value', sortOrder },
    );
    expect(numbers.slice(0, 2).map((row) => row.value)).toEqual(
      sortOrder === 'asc' ? [1, 3] : [3, 1],
    );
    expect(numbers.slice(2)).toEqual([numeric[1], numeric[3], numeric[4]]);
    expect(
      sortRows(
        numeric.slice(0, 3),
        [{ dataIndex: 'value', header: 'Value', sortable: true }],
        { sortField: 'value', sortOrder },
      ),
    ).toEqual(
      sortOrder === 'asc'
        ? [numeric[2], numeric[0], numeric[1]]
        : [numeric[0], numeric[2], numeric[1]],
    );
    const dates = [
      { value: new Date('2025-01-01') },
      { value: new Date('invalid') },
      { value: new Date('2020-01-01') },
    ];
    const sorted = sortRows(
      dates,
      [{ dataIndex: 'value', header: 'Value', type: 'date', sortable: true }],
      { sortField: 'value', sortOrder },
    );
    expect(sorted).toEqual(
      sortOrder === 'asc'
        ? [dates[2], dates[0], dates[1]]
        : [dates[0], dates[2], dates[1]],
    );
  },
);

test('schema changes prune sort/filter/search and replace a pending server request', () => {
  vi.useFakeTimers();
  const onChange = vi.fn<(request: TableChange) => void>();
  const rows = [{ id: 1, name: 'Ava', role: 'Engineer' }];
  const columns = [
    {
      dataIndex: 'name',
      header: 'Name',
      sortable: true,
      filterable: true,
      searchable: true,
      defaultSearchValue: 'Ava',
      defaultFilterValue: ['Ava'],
      defaultSortOrder: 'asc' as const,
    },
    { dataIndex: 'role', header: 'Role' },
  ];
  const pagination = { currentPage: 2, pageSize: 10, totalItems: 20 };
  const view = render(
    <MantineProvider env='test'>
      <DataTable
        columns={columns}
        rows={rows}
        pagination={pagination}
        onChange={onChange}
      />
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Sort Name: asc' }));
  view.rerender(
    <MantineProvider env='test'>
      <DataTable
        columns={[columns[1]]}
        rows={rows}
        pagination={pagination}
        onChange={onChange}
      />
    </MantineProvider>,
  );
  act(() => vi.advanceTimersByTime(300));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      sorter: undefined,
      filters: [],
      columnSearch: [],
      pagination: expect.objectContaining({ currentPage: 1 }),
    }),
  );
});

test('removed search fields do not exclude new rows; hidden columns retain their search', () => {
  const columns = [
    {
      dataIndex: 'name',
      header: 'Name',
      searchable: true,
      defaultSearchValue: 'Ava',
    },
    { dataIndex: 'role', header: 'Role' },
  ];
  const view = render(
    <MantineProvider env='test'>
      <DataTable
        columns={columns}
        rows={[
          { id: 1, name: 'Ava', role: 'Engineer' },
          { id: 2, name: 'Bob', role: 'Designer' },
        ]}
        columnSelector
      />
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Select columns' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Name' }));
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
  expect(screen.queryByRole('cell', { name: 'Designer' })).toBeNull();
  view.rerender(
    <MantineProvider env='test'>
      <DataTable
        columns={[columns[1]]}
        rows={[{ id: 3, role: 'Designer' }]}
        columnSelector
      />
    </MantineProvider>,
  );
  expect(screen.getByRole('cell', { name: 'Designer' })).toBeTruthy();
});

test('missing and duplicate IDs cannot select or expand another row; warnings are emitted once', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const rows = [
    { name: 'Missing' },
    { id: 0, name: 'Zero' },
    { id: 'dup', name: 'First' },
    { id: 'dup', name: 'Second' },
  ];
  const selection = { selectedIds: [0], onChange: vi.fn() };
  const columns = [{ dataIndex: 'name', header: 'Name' }];
  const expandable = { render: (row: (typeof rows)[number]) => row.name };
  const view = render(
    <MantineProvider env='test'>
      <DataTable
        rows={rows}
        columns={columns}
        selection={selection}
        expandable={expandable}
      />
    </MantineProvider>,
  );
  expect(
    (screen.getByRole('checkbox', { name: 'Select row 0' }) as HTMLInputElement)
      .checked,
  ).toBe(true);
  expect(
    screen
      .getByRole('checkbox', { name: 'Select row 1 (invalid ID)' })
      .hasAttribute('disabled'),
  ).toBe(true);
  expect(
    screen
      .getByRole('checkbox', { name: 'Select row 3 (invalid ID)' })
      .hasAttribute('disabled'),
  ).toBe(true);
  expect(
    screen
      .getByRole('button', { name: 'Expand row 4 (invalid ID)' })
      .hasAttribute('disabled'),
  ).toBe(true);
  expect(error).not.toHaveBeenCalled();
  expect(warn).toHaveBeenCalledTimes(2);
  view.rerender(
    <MantineProvider env='test'>
      <DataTable
        rows={[...rows]}
        columns={columns}
        selection={selection}
        expandable={expandable}
      />
    </MantineProvider>,
  );
  expect(warn).toHaveBeenCalledTimes(2);
});

test('distinct string and numeric IDs keep unique keys/panels and retain controlled expansion', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const ids = ['a b', 'a?b', 1, '1'];
  const view = render(
    <MantineProvider env='test'>
      <DataTable
        rows={ids.map((id) => ({ id, name: String(id) }))}
        columns={[{ dataIndex: 'name', header: 'Name' }]}
        expandable={{
          allowMultiple: true,
          expandedIds: ids,
          render: (row) => <span>Details {row.name}</span>,
        }}
      />
    </MantineProvider>,
  );
  const panels = [...view.container.querySelectorAll('tbody tr[id]')];
  expect(new Set(panels.map((panel) => panel.id)).size).toBe(4);
  for (const button of screen.getAllByRole('button', {
    name: /Collapse row/,
  })) {
    expect(
      panels.some((panel) => panel.id === button.getAttribute('aria-controls')),
    ).toBe(true);
  }
  expect(error).not.toHaveBeenCalled();
});

test.each(['number', 'date'] as const)(
  '%s filter names are accessible without visible input labels',
  async (type) => {
    const rows = [
      { id: 1, value: type === 'date' ? new Date('2024-01-01') : 20 },
    ];
    const columns: DataTableColumn<(typeof rows)[number]>[] = [
      {
        dataIndex: 'value',
        header: <span>Value</span>,
        type,
        filterable: true,
      },
    ];
    const view = render(
      <MantineProvider env='test'>
        <DataTable rows={rows} columns={columns} />
      </MantineProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter value' }));
    fireEvent.click(
      screen.getByRole('combobox', { name: 'value filter operator' }),
    );
    fireEvent.click(screen.getByRole('option', { name: 'Between' }));
    expect(await screen.findByLabelText('value filter from')).toBeTruthy();
    expect(screen.getByLabelText('value filter to')).toBeTruthy();
    expect(view.container.querySelector('label')).toBeNull();
  },
);

test('bulk toolbar hides/inerts standard controls and restores the search draft and focus on clear', () => {
  const rows = [
    { id: 1, name: 'A' },
    { id: 2, name: 'B' },
  ];
  function Example() {
    const [ids, setIds] = useState<(string | number)[]>([]);
    return (
      <DataTable
        rows={rows}
        columns={[{ dataIndex: 'name', header: 'Name' }]}
        globalSearch
        showReset
        toolbar
        selection={{ selectedIds: ids, onChange: ({ ids }) => setIds(ids) }}
      />
    );
  }
  render(
    <MantineProvider env='test'>
      <Example />
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open global search' }));
  const search = screen.getByRole('textbox', { name: 'Search all columns' });
  fireEvent.change(search, { target: { value: 'draft' } });
  fireEvent.click(
    screen.getByRole('checkbox', { name: 'Select all rows on this page' }),
  );
  expect(
    screen.queryByRole('button', { name: 'Reset table state' }),
  ).toBeNull();
  expect(search.closest('[inert]')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
  expect(screen.getByRole('textbox', { name: 'Search all columns' })).toBe(
    search,
  );
  expect((search as HTMLInputElement).value).toBe('draft');
  expect(document.activeElement).toBe(search);
});

test('control widths are measured and updates reach pinned headers and cells', () => {
  let selectionWidth = 72;
  let expansionWidth = 64;
  const callbacks: ResizeObserverCallback[] = [];
  globalThis.ResizeObserver = class {
    constructor(callback: ResizeObserverCallback) {
      callbacks.push(callback);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      const width =
        this.dataset.control === 'selection'
          ? selectionWidth
          : this.dataset.control === 'expansion'
            ? expansionWidth
            : 100;
      return { width } as DOMRect;
    },
  );
  render(
    <MantineProvider env='test'>
      <DataTable
        rows={[{ id: 1, name: 'A' }]}
        columns={[{ dataIndex: 'name', header: 'Name', sticky: 'left' }]}
        horizontalSpacing='xl'
        selection={{ selectedIds: [], onChange: vi.fn() }}
        expandable={{ render: () => 'Details' }}
      />
    </MantineProvider>,
  );
  expect(
    screen
      .getByRole('columnheader', { name: 'Name' })
      .style.getPropertyValue('--dt-pin-offset'),
  ).toBe('136px');
  expect(
    screen
      .getByRole('columnheader', { name: 'Expand rows' })
      .style.getPropertyValue('--dt-pin-offset'),
  ).toBe('72px');
  selectionWidth = 80;
  expansionWidth = 70;
  act(() => {
    for (const callback of callbacks) callback([], {} as ResizeObserver);
  });
  expect(
    screen
      .getByRole('cell', { name: 'A' })
      .style.getPropertyValue('--dt-pin-offset'),
  ).toBe('150px');
});
