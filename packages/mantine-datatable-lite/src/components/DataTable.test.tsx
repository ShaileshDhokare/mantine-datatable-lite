import { MantineProvider } from '@mantine/core';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { DataTable } from './DataTable';

afterEach(cleanup);

test('renders a table with the supplied headers', () => {
  render(
    <MantineProvider env="test">
      <DataTable columns={[{ dataIndex: 'name', header: 'Name' }]} records={[]} />
    </MantineProvider>,
  );

  expect(screen.getByRole('table')).toBeTruthy();
  expect(screen.getByRole('columnheader', { name: 'Name' })).toBeTruthy();
});
