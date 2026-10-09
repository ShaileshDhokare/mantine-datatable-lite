import { MantineProvider } from '@mantine/core';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { DataTable } from './components/DataTable';
import {
  pruneColumnLayout,
  readColumnLayout,
  writeColumnLayout,
} from './utils/columnLayoutStorage';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

test('restores only hidden and pinned columns after remount', async () => {
  const columns = [
    { dataIndex: 'name', header: 'Name', showMenu: true },
    { dataIndex: 'age', header: 'Age', showMenu: true },
    { dataIndex: 'role', header: 'Role', showMenu: true },
  ];
  const table = (
    <MantineProvider env='test'>
      <DataTable
        columns={columns}
        rows={[{ name: 'Ava', age: 24, role: 'Engineer' }]}
        columnSelector
        persistKey='test:layout'
      />
    </MantineProvider>
  );
  const first = render(table);
  fireEvent.click(screen.getByRole('button', { name: 'Select columns' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Age' }));
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
  fireEvent.click(screen.getByRole('button', { name: 'Role menu' }));
  fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Pin' }));
  fireEvent.click(
    await screen.findByRole('menuitem', { name: 'Pin to right' }),
  );
  await waitFor(() =>
    expect(JSON.parse(window.localStorage.getItem('test:layout')!)).toEqual({
      v: 1,
      data: { hiddenColumns: ['age'], pinned: { left: [], right: ['role'] } },
    }),
  );
  first.unmount();
  render(table);
  await waitFor(() =>
    expect(screen.getAllByRole('columnheader')).toHaveLength(2),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Role menu' }));
  fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Pin' }));
  expect(
    (
      await screen.findByRole('menuitem', { name: 'Pin to right' })
    ).getAttribute('data-disabled'),
  ).not.toBeNull();
});

test('storage helpers are safe without window during server rendering', () => {
  const browserWindow = window;
  vi.stubGlobal('window', undefined);
  try {
    expect(
      readColumnLayout('table', [{ dataIndex: 'name', header: 'Name' }]),
    ).toBeUndefined();
    expect(() =>
      writeColumnLayout('table', {
        hiddenColumns: [],
        pinned: { left: [], right: [] },
      }),
    ).not.toThrow();
  } finally {
    vi.stubGlobal('window', browserWindow);
  }
});

test('ignores invalid storage and prunes removed or non-hideable columns', () => {
  const columns = [
    { dataIndex: 'name', header: 'Name', hideable: false },
    { dataIndex: 'role', header: 'Role' },
  ];
  window.localStorage.setItem('bad', '{');
  expect(readColumnLayout('bad', columns)).toBeUndefined();
  window.localStorage.setItem(
    'bad',
    JSON.stringify({ v: 2, data: { hiddenColumns: [] } }),
  );
  expect(readColumnLayout('bad', columns)).toBeUndefined();
  expect(
    pruneColumnLayout(
      {
        hiddenColumns: ['name', 'role', 'removed'],
        pinned: { left: ['removed', 'role'], right: ['role', 'name'] },
      },
      columns,
    ),
  ).toEqual({
    hiddenColumns: ['role'],
    pinned: { left: [], right: ['name'] },
  });
});

test('removes obsolete column IDs from persisted layout when columns change', async () => {
  window.localStorage.setItem(
    'test:changing',
    JSON.stringify({
      v: 1,
      data: { hiddenColumns: ['age'], pinned: { left: [], right: ['role'] } },
    }),
  );
  const rows = [{ name: 'Ava', age: 24, role: 'Engineer' }];
  const firstColumns = [
    { dataIndex: 'name', header: 'Name' },
    { dataIndex: 'age', header: 'Age' },
    { dataIndex: 'role', header: 'Role' },
  ];
  const view = render(
    <MantineProvider env='test'>
      <DataTable
        columns={firstColumns}
        rows={rows}
        persistKey='test:changing'
      />
    </MantineProvider>,
  );
  await waitFor(() =>
    expect(screen.getAllByRole('columnheader')).toHaveLength(2),
  );
  view.rerender(
    <MantineProvider env='test'>
      <DataTable
        columns={[firstColumns[0], firstColumns[2]]}
        rows={rows}
        persistKey='test:changing'
      />
    </MantineProvider>,
  );
  await waitFor(() =>
    expect(
      JSON.parse(window.localStorage.getItem('test:changing')!).data
        .hiddenColumns,
    ).toEqual([]),
  );
  expect(
    readColumnLayout('test:changing', [firstColumns[0], firstColumns[2]]),
  ).toEqual({
    hiddenColumns: [],
    pinned: { left: [], right: ['role'] },
  });
});

test('unavailable storage leaves the table state in memory', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  expect(
    readColumnLayout('table', [{ dataIndex: 'name', header: 'Name' }]),
  ).toBeUndefined();
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('full');
  });
  expect(() =>
    writeColumnLayout('table', {
      hiddenColumns: [],
      pinned: { left: [], right: [] },
    }),
  ).not.toThrow();
});
