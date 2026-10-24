import { MantineProvider, Stack, Title } from '@mantine/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { DataTable } from './components/DataTable';
import classes from './styles/styles.module.css';
import type { DataTableColumn, DataTableLabels } from './types';

afterEach(cleanup);

type Person = { id: number; name: string; age: number; joined: Date };

const people: Person[] = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  name: `Person ${index + 1}`,
  age: 20 + index,
  joined: new Date(2024, 0, index + 1),
}));

const columns: DataTableColumn<Person>[] = [
  {
    dataIndex: 'name',
    header: 'Name',
    sortable: true,
    defaultSortOrder: 'desc',
    showMenu: true,
    showSortIcon: true,
  },
  { dataIndex: 'age', header: 'Age', type: 'number', filterable: true },
  {
    dataIndex: 'joined',
    header: 'Joined',
    type: 'date',
    filterable: true,
    defaultFilterValue: { operator: 'gte', value: new Date(2024, 0, 15) },
  },
];

// Without default sort or filters, so rows keep their order.
const nameOnly: DataTableColumn<Person>[] = [{ dataIndex: 'name', header: 'Name' }];

const german: Partial<DataTableLabels> = {
  sortColumn: (column, order) =>
    `${column} sortieren (${order === 'asc' ? 'aufsteigend' : order === 'desc' ? 'absteigend' : 'unsortiert'})`,
  sortOrder: { asc: 'AUF', desc: 'AB' },
  sortedBy: 'Sortiert nach:',
  columnMenu: (column) => `Menü ${column}`,
  filter: 'Filtern',
  value: 'Wert',
  filterOperator: (column) => `Operator für ${column}`,
  filterInput: (column, input) => `${column}: ${input}`,
  removePill: (pill) => `${pill} entfernen`,
  formatDate: (date) =>
    `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`,
  pageControl: (control) =>
    ({
      first: 'Erste Seite',
      previous: 'Vorherige Seite',
      next: 'Nächste Seite',
      last: 'Letzte Seite',
    })[control],
};

test('screen reader labels, pill text and dates come from labels', () => {
  render(
    <MantineProvider env='test'>
      <DataTable
        rows={people}
        columns={columns}
        pagination
        showTableStatePills
        labels={german}
      />
    </MantineProvider>,
  );
  expect(
    screen.getByRole('button', { name: 'Name sortieren (absteigend)' }),
  ).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Menü Name' })).toBeTruthy();
  expect(
    screen.getByRole('button', { name: 'Sortiert nach: Name AB entfernen' }),
  ).toBeTruthy();
  expect(
    screen.getByRole('button', { name: 'Joined: ≥ 15.1.2024 entfernen' }),
  ).toBeTruthy();
  for (const name of [
    'Erste Seite',
    'Vorherige Seite',
    'Nächste Seite',
    'Letzte Seite',
  ]) {
    expect(screen.getByRole('button', { name })).toBeTruthy();
  }
  fireEvent.click(screen.getByRole('button', { name: 'Filtern Age' }));
  expect(screen.getByRole('combobox', { name: 'Operator für Age' })).toBeTruthy();
  expect(screen.getByRole('textbox', { name: 'Age: Wert' })).toBeTruthy();
});

test('default labels keep the English wording', () => {
  render(
    <MantineProvider env='test'>
      <DataTable rows={people} columns={columns} pagination showTableStatePills />
    </MantineProvider>,
  );
  expect(screen.getByRole('button', { name: 'Sort Name: desc' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Name menu' })).toBeTruthy();
  expect(
    screen.getByRole('button', { name: 'Remove Sort by: Name DESC' }),
  ).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Next page' })).toBeTruthy();
});

test('the table takes an accessible name', () => {
  render(
    <MantineProvider env='test'>
      <DataTable rows={people} columns={columns} aria-label='People' />
      <Title id='team-heading'>Team</Title>
      <DataTable
        rows={people}
        columns={columns}
        aria-labelledby='team-heading'
      />
    </MantineProvider>,
  );
  expect(screen.getByRole('table', { name: 'People' })).toBeTruthy();
  expect(screen.getByRole('table', { name: 'Team' })).toBeTruthy();
});

test('a status region announces the selection from the first row', () => {
  render(
    <MantineProvider env='test'>
      <DataTable rows={people.slice(0, 3)} columns={nameOnly} selection={{}} />
    </MantineProvider>,
  );
  const status = screen.getByRole('status');
  expect(status.textContent).toBe('');
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
  expect(screen.getByRole('status')).toBe(status);
  expect(status.textContent).toBe('1 row selected');
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 2' }));
  expect(status.textContent).toBe('2 rows selected');
});

test('one root element, and the bulk bar shares the toolbar slot', () => {
  render(
    <MantineProvider env='test'>
      <Stack data-testid='parent'>
        <DataTable
          rows={people}
          columns={nameOnly}
          pagination
          globalSearch
          selection={{ renderBulkActions: () => <button>Archive</button> }}
        />
      </Stack>
    </MantineProvider>,
  );
  // A parent Stack's gap cannot reach the toolbar, table and pagination.
  const parent = screen.getByTestId('parent');
  expect(parent.children).toHaveLength(1);
  expect(parent.firstElementChild?.classList.contains(classes.wrapper)).toBe(
    true,
  );
  const toolbar = screen
    .getByRole('button', { name: 'Open global search' })
    .closest('.mantine-Paper-root') as HTMLElement;
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
  const bar = screen
    .getByRole('button', { name: 'Archive' })
    .closest(`.${classes.bulkBar}`) as HTMLElement;
  expect(bar.parentElement).toBe(toolbar.parentElement);
  expect(toolbar.parentElement?.classList.contains(classes.toolbars)).toBe(
    true,
  );
  expect(toolbar.hasAttribute('inert')).toBe(true);
  expect(toolbar.getAttribute('aria-hidden')).toBe('true');
});
