import { MantineProvider } from '@mantine/core';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { DataTable } from './DataTable';

vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

afterEach(cleanup);

test('height-limited scrolling keeps the right-pinned edge free of a side gutter', () => {
  const measurement = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue(new DOMRect(0, 0, 100, 30));
  try {
    const { container } = render(
      <MantineProvider env='test'>
        <DataTable
          columns={[
            { dataIndex: 'name', header: 'Name' },
            { dataIndex: 'joined', header: 'Joined', sticky: 'right' },
          ]}
          rows={[{ id: 1, name: 'Ada', joined: '2024-01-01' }]}
          minWidth={500}
          maxHeight={300}
          stickyHeader
        />
      </MantineProvider>,
    );
    const viewport = container.querySelector(
      '.mantine-ScrollArea-viewport',
    );
    // Both axes still scroll; only the bottom scrollbar reserves content space.
    expect(viewport?.getAttribute('data-scrollbars')).toBe('xy');
    expect(viewport?.getAttribute('data-offset-scrollbars')).toBe('x');
    const header = screen.getByRole('columnheader', { name: 'Joined' });
    expect(header.getAttribute('data-pinned')).toBe('right');
    expect(header.style.getPropertyValue('--dt-pin-offset')).toBe('0px');
    expect(
      screen
        .getByRole('cell', { name: '2024-01-01' })
        .getAttribute('data-pinned'),
    ).toBe('right');
  } finally {
    measurement.mockRestore();
  }
});

test('renders headers, row values, and custom cells', () => {
  render(
    <MantineProvider env='test'>
      <DataTable
        columns={[
          { dataIndex: 'name', header: 'Name' },
          {
            dataIndex: 'display',
            header: 'Display',
            render: (row) => row.name.toUpperCase(),
          },
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
])(
  'uses a scroll container only when a size is supplied: $sizes',
  ({ sizes, wrapped }) => {
    const { container } = render(
      <MantineProvider env='test'>
        <DataTable
          columns={[{ dataIndex: 'name', header: 'Name' }]}
          rows={[]}
          {...sizes}
        />
      </MantineProvider>,
    );

    expect(
      Boolean(
        container.querySelector(
          '.mantine-TableScrollContainer-scrollContainer',
        ),
      ),
    ).toBe(wrapped);
  },
);
