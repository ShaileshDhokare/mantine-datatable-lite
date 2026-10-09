import { expectTypeOf, test } from 'vitest';
import { DataTable } from './components/DataTable';
import type {
  DataTableProps,
  IdAccessor,
  NumericFilterValue,
  DateFilterValue,
} from './types';

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
  // @ts-expect-error Scalar operators cannot take a tuple.
  const invalidScalar: DateFilterValue = {
    operator: 'eq',
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
