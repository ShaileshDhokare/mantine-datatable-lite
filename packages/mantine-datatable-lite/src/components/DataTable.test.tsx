import { MantineProvider } from '@mantine/core';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { DataTable } from './DataTable';

vi.stubGlobal('ResizeObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
});

afterEach(cleanup);

test('renders headers, row values, and custom cells', () => {
  render(
    <MantineProvider env="test">
      <DataTable
        columns={[
          { dataIndex: 'name', header: 'Name' },
          { dataIndex: 'display', header: 'Display', render: (row) => row.name.toUpperCase() },
        ]}
        rows={[{ name: 'Ada' }]}
      />
    </MantineProvider>,
  );

  expect(screen.getByRole('table')).toBeTruthy();
  expect(screen.getByRole('columnheader', { name: 'Name' })).toBeTruthy();
  expect(screen.getByRole('cell', { name: 'Ada' })).toBeTruthy();
  expect(screen.getByRole('cell', { name: 'ADA' })).toBeTruthy();
});

test.each([
  { sizes: {}, wrapped: false },
  { sizes: { minWidth: 500 }, wrapped: true },
  { sizes: { maxHeight: 300 }, wrapped: true },
  { sizes: { minWidth: '50rem', maxHeight: '20rem' }, wrapped: true },
])('uses a scroll container only when a size is supplied: $sizes', ({ sizes, wrapped }) => {
  const { container } = render(
    <MantineProvider env="test">
      <DataTable columns={[{ dataIndex: 'name', header: 'Name' }]} rows={[]} {...sizes} />
    </MantineProvider>,
  );

  expect(Boolean(container.querySelector('.mantine-TableScrollContainer-scrollContainer'))).toBe(wrapped);
});
