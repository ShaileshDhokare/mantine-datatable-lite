import { DatePickerInput } from '@mantine/dates';
import { expectTypeOf, test } from 'vitest';
import { DataTable } from './index';
import type {
  DataTableProps,
  DateInputProps,
  IdAccessor,
  NumericFilterValue,
  DateFilterValue,
} from './index';

test('row inference and public filter/identity contracts remain type safe', () => {
  type Row = { id: number; name: string; active: boolean };
  const rows: Row[] = [{ id: 1, name: 'A', active: true }];
  const element = (
    <DataTable
      rows={rows}
      columns={[
        {
          dataIndex: 'name',
          header: 'Name',
          render: (row) => {
            expectTypeOf(row).toEqualTypeOf<Row>();
            return row.name;
          },
        },
      ]}
      onRowClick={(row) => {
        expectTypeOf(row).toEqualTypeOf<Row>();
      }}
    />
  );
  expectTypeOf(element).not.toBeAny();
  expectTypeOf<DataTableProps<Row>['idAccessor']>().toEqualTypeOf<
    IdAccessor<Row> | undefined
  >();
  const numeric: NumericFilterValue = { operator: 'between', value: [1, 2] };
  const date: DateFilterValue = { operator: 'eq', value: new Date() };
  // @ts-expect-error Between requires two bounds.
  const invalidRange: NumericFilterValue = { operator: 'between', value: 1 };
  const invalidScalar: DateFilterValue = {
    operator: 'eq',
    // @ts-expect-error Scalar operators cannot take a tuple.
    value: [new Date(), new Date()],
  };
  // @ts-expect-error Boolean fields do not identify rows.
  const invalidAccessor: IdAccessor<Row> = 'active';
  expectTypeOf(numeric).not.toBeAny();
  expectTypeOf(date).not.toBeAny();
  expectTypeOf(invalidRange).not.toBeAny();
  expectTypeOf(invalidScalar).not.toBeAny();
  expectTypeOf(invalidAccessor).not.toBeAny();
});

test('pagination, selection, expansion and date input accept their simplest forms', () => {
  type Row = { id: number; name: string; city: { name: string } };
  const rows: Row[] = [{ id: 1, name: 'A', city: { name: 'Pune' } }];
  const columns = [{ dataIndex: 'name' as const, header: 'Name' }];
  const element = (
    <DataTable
      rows={rows}
      columns={[
        ...columns,
        {
          dataIndex: 'city',
          header: 'City',
          getValue: (row) => {
            expectTypeOf(row).toEqualTypeOf<Row>();
            return row.city.name;
          },
        },
      ]}
      pagination
      selection={{ renderBulkActions: ({ ids }) => ids.length }}
      dateInput={DatePickerInput}
    />
  );
  expectTypeOf(element).not.toBeAny();
  expectTypeOf(DatePickerInput).toExtend<
    NonNullable<DataTableProps<Row>['dateInput']>
  >();
  expectTypeOf<DateInputProps['value']>().toEqualTypeOf<string | null>();
  // @ts-expect-error Expansion takes a config object, not a boolean.
  const invalidExpandable = <DataTable rows={rows} columns={columns} expandable />;
  // @ts-expect-error The bulk toolbar prop was removed; use selection.renderBulkActions.
  const removedToolbar = <DataTable rows={rows} columns={columns} toolbar />;
  expectTypeOf(invalidExpandable).not.toBeAny();
  expectTypeOf(removedToolbar).not.toBeAny();
});
