import type { ColumnSearch, DataTableColumn } from '../../types';
import { columnValue } from '../columnValue';

function text(value: unknown): string {
  return value == null ? '' : String(value).toLocaleLowerCase();
}

/** Column searches (AND) plus a global search across all columns not marked `searchable: false`. */
export function searchRows<T>(
  rows: T[],
  columns: DataTableColumn<T>[],
  columnSearch: ColumnSearch[],
  searchQuery: string,
): T[] {
  if (!columnSearch.length && !searchQuery) return rows;
  const byField = new Map(columns.map((column) => [column.dataIndex, column]));
  const terms = columnSearch.flatMap(({ field, value }) => {
    const column = byField.get(field);
    return column?.searchable === true
      ? [{ column, value: value.toLocaleLowerCase() }]
      : [];
  });
  const globalTerm = searchQuery.toLocaleLowerCase();
  const globalColumns = columns.filter((column) => column.searchable !== false);

  return rows.filter(
    (row) =>
      terms.every(({ column, value }) =>
        text(columnValue(column, row)).includes(value),
      ) &&
      (!globalTerm ||
        globalColumns.some((column) =>
          text(columnValue(column, row)).includes(globalTerm),
        )),
  );
}
