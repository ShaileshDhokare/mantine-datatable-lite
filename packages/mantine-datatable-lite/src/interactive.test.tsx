import { ActionIcon, MantineProvider, Tooltip } from '@mantine/core';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { useState } from 'react';
import { DataTable } from './components/DataTable';
import { rowActionsColumn } from './rowActionsColumn';

vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
afterEach(() => { cleanup(); vi.useRealTimers(); });

test('pin menu moves a column to each side and reorders pinned neighbors', async () => {
  render(<MantineProvider env='test'><DataTable rows={[{ id: 1, a: 'A', b: 'B', c: 'C' }]}
    columns={['a', 'b', 'c'].map((field) => ({ dataIndex: field, header: field.toUpperCase(), showMenu: true }))}
    minWidth={700} /></MantineProvider>);
  const headers = () => screen.getAllByRole('columnheader').map((cell) => cell.getAttribute('data-column'));
  fireEvent.click(screen.getByRole('button', { name: 'B menu' }));
  fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Pin' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Pin to left' }));
  expect(headers()).toEqual(['b', 'a', 'c']);
  fireEvent.click(screen.getByRole('button', { name: 'C menu' }));
  fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Pin' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Pin to left' }));
  expect(headers()).toEqual(['b', 'c', 'a']);
  fireEvent.click(screen.getByRole('button', { name: 'C menu' }));
  fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Pin' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Move left' }));
  expect(headers()).toEqual(['c', 'b', 'a']);
});

test('measured pinned headers and cells receive sticky offsets', () => {
  const original = HTMLElement.prototype.getBoundingClientRect;
  const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return this.tagName === 'TH' ? { width: 100 } as DOMRect : original.call(this);
  });
  try {
    render(<MantineProvider env='test'><DataTable rows={[{ id: 1, a: 'A', b: 'B', c: 'C' }]}
      columns={[{ dataIndex: 'a', header: 'A', sticky: 'left' },
        { dataIndex: 'b', header: 'B', sticky: 'left' },
        { dataIndex: 'c', header: 'C', sticky: 'right' }]} /></MantineProvider>);
    expect(screen.getByRole('columnheader', { name: 'A' }).getAttribute('data-pinned')).toBe('left');
    expect(screen.getByRole('columnheader', { name: 'B' }).getAttribute('style')).toContain('100px');
    expect(screen.getByRole('columnheader', { name: 'C' }).getAttribute('data-pinned')).toBe('right');
    expect(screen.getByRole('cell', { name: 'B' }).getAttribute('style')).toContain('100px');
  } finally { rect.mockRestore(); }
});

test('expand icon reveals a full-width panel with accessible controls', () => {
  render(<MantineProvider env='test'><DataTable rows={[{ id: 1, name: 'Ava' }]}
    columns={[{ dataIndex: 'name', header: 'Name' }]}
    expandable={{ render: (row) => <div>Details for {row.name}</div> }} /></MantineProvider>);
  const button = screen.getByRole('button', { name: 'Expand row 1' });
  expect(button.getAttribute('aria-expanded')).toBe('false');
  fireEvent.click(button);
  expect(screen.getByText('Details for Ava')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Collapse row 1' }).getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByText('Details for Ava').closest('td')?.getAttribute('colspan')).toBe('2');
});

test('page selection is tri-state and supplies row objects', () => {
  const rows = [{ id: 1, name: 'Ava' }, { id: 2, name: 'Bob' }];
  const onBulk = vi.fn();
  function Example() {
    const [ids, setIds] = useState<(string | number)[]>([]);
    return <DataTable rows={rows} columns={[{ dataIndex: 'name', header: 'Name' }]} toolbar
      globalSearch selection={{ selectedIds: ids, onChange: (snapshot) => setIds(snapshot.ids),
        renderBulkActions: ({ loadedRows }) => <button onClick={() => onBulk(loadedRows)}>Bulk</button> }} />;
  }
  render(<MantineProvider env='test'><Example /></MantineProvider>);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
  expect((screen.getByRole('checkbox', { name: 'Select all rows on this page' }) as HTMLInputElement).indeterminate).toBe(true);
  expect(screen.queryByText('1 rows selected')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Bulk' })).toBeNull();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
  expect(screen.getByText('2 rows selected')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Bulk' }));
  expect(onBulk).toHaveBeenCalledWith(rows);
  fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
  expect(screen.queryByRole('button', { name: 'Bulk' })).toBeNull();
  expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3);
});

test('selection toolbar is opt in and renders direct and tooltip actions only for multiple rows', () => {
  const direct = vi.fn();
  const wrapped = vi.fn();
  const rows = [{ id: 1, name: 'Ava' }, { id: 2, name: 'Bob' }];
  function Example({ toolbar }: { toolbar: boolean }) {
    const [ids, setIds] = useState<(string | number)[]>([]);
    return <DataTable columns={[{ dataIndex: 'name', header: 'Name' }]} rows={rows}
      toolbar={toolbar} toolbarActions={[
        <ActionIcon key='direct' aria-label='Direct action' onClick={direct}>D</ActionIcon>,
        <Tooltip key='wrapped' label='Wrapped action'>
          <ActionIcon aria-label='Wrapped action' onClick={wrapped}>W</ActionIcon>
        </Tooltip>,
      ]} selection={{ selectedIds: ids, onChange: ({ ids: next }) => setIds(next) }} />;
  }
  const view = render(<MantineProvider env='test'><Example toolbar /></MantineProvider>);
  expect(view.container.querySelector('.mantine-Paper-root')).toBeNull();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
  expect(view.container.querySelector('.mantine-Paper-root')).toBeNull();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 2' }));
  fireEvent.click(screen.getByRole('button', { name: 'Direct action' }));
  fireEvent.click(screen.getByRole('button', { name: 'Wrapped action' }));
  expect(direct).toHaveBeenCalledTimes(1);
  expect(wrapped).toHaveBeenCalledTimes(1);
  view.rerender(<MantineProvider env='test'><Example toolbar={false} /></MantineProvider>);
  expect(view.container.querySelector('.mantine-Paper-root')).toBeNull();
});

test('filter change clears selection while sort and page changes preserve it', () => {
  const first = [{ id: 1, name: 'Ava' }, { id: 2, name: 'Bob' }];
  const second = [{ id: 3, name: 'Cara' }];
  const changes = vi.fn();
  function Example({ page }: { page: number }) {
    const [ids, setIds] = useState<(string | number)[]>([]);
    return <DataTable rows={page === 1 ? first : second}
      columns={[{ dataIndex: 'name', header: 'Name', sortable: true, filterable: true,
        filterOptions: ['Cara'] }]}
      pagination={{ currentPage: page, pageSize: 2, totalItems: 3 }}
      selection={{ selectedIds: ids, onChange: (next) => { changes(next); setIds(next.ids); } }} />;
  }
  const view = render(<MantineProvider env='test'><Example page={1} /></MantineProvider>);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
  fireEvent.click(screen.getByRole('button', { name: 'Sort Name: none' }));
  expect((screen.getByRole('checkbox', { name: 'Select row 1' }) as HTMLInputElement).checked).toBe(true);
  view.rerender(<MantineProvider env='test'><Example page={2} /></MantineProvider>);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 3' }));
  expect(changes).toHaveBeenLastCalledWith(expect.objectContaining({ ids: [1, 3] }));
  fireEvent.click(screen.getByRole('button', { name: 'Filter Name' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Cara' }));
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
  expect(changes).toHaveBeenLastCalledWith(expect.objectContaining({ ids: [], count: 0 }));
});

test('search resets controlled selection and only selectable page rows are selected', () => {
  vi.useFakeTimers();
  const rows = [{ id: 1, name: 'Ava', active: true }, { id: 2, name: 'Bob', active: false }];
  const changes = vi.fn();
  function Example() {
    const [ids, setIds] = useState<(string | number)[]>([]);
    return <DataTable rows={rows} columns={[{ dataIndex: 'name', header: 'Name' }]}
      globalSearch selection={{ selectedIds: ids, isSelectable: (row) => row.active,
        onChange: (snapshot) => { changes(snapshot); setIds(snapshot.ids); } }} />;
  }
  render(<MantineProvider env='test'><Example /></MantineProvider>);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
  expect(changes).toHaveBeenLastCalledWith(expect.objectContaining({ ids: [1], loadedRows: [rows[0]] }));
  expect((screen.getByRole('checkbox', { name: 'Select row 2' }) as HTMLInputElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Open global search' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Search all columns' }), { target: { value: 'Bob' } });
  act(() => vi.advanceTimersByTime(300));
  expect(changes).toHaveBeenLastCalledWith(expect.objectContaining({ ids: [], count: 0 }));
});

test('row action clicks do not trigger row click or expansion', () => {
  const onRowClick = vi.fn();
  render(<MantineProvider env='test'><DataTable rows={[{ id: 1, name: 'Ava' }]}
    columns={[{ dataIndex: 'name', header: 'Name' },
      rowActionsColumn<{ id: number; name: string }>({ render: () => <button>Action</button> })]}
    onRowClick={onRowClick} expandable={{ trigger: 'row', render: () => 'Details' }} /></MantineProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Action' }));
  expect(onRowClick).not.toHaveBeenCalled();
  expect(screen.queryByText('Details')).toBeNull();
});

test('selecting text does not trigger row expansion or row click', () => {
  const onRowClick = vi.fn();
  const selection = vi.spyOn(window, 'getSelection').mockReturnValue({ toString: () => 'Ava' } as Selection);
  try {
    render(<MantineProvider env='test'><DataTable rows={[{ id: 1, name: 'Ava' }]}
      columns={[{ dataIndex: 'name', header: 'Name' }]} onRowClick={onRowClick}
      expandable={{ trigger: 'row', render: () => 'Details' }} /></MantineProvider>);
    fireEvent.click(screen.getByRole('cell', { name: 'Ava' }));
    expect(screen.queryByText('Details')).toBeNull();
    expect(onRowClick).not.toHaveBeenCalled();
  } finally {
    selection.mockRestore();
  }
});
