import type { ColumnSearch, DataTableColumn } from '../../types';

export function searchRows<T>(rows: T[], columns: DataTableColumn<T>[], columnSearch: ColumnSearch[], searchQuery: string): T[] {
  if (!columnSearch.length && !searchQuery) return rows;
  const terms = columnSearch.map(({ searchField, searchValue }) => ({ field: searchField, value: searchValue.toLocaleLowerCase() }));
  const globalTerm = searchQuery.toLocaleLowerCase();
  const globalColumns = columns.filter((column) => column.searchable !== false);

  return rows.filter((row) => {
    const values = row as Record<string, unknown>;
    return terms.every(({ field, value }) => String(values[field] ?? '').toLocaleLowerCase().includes(value))
      && (!globalTerm || globalColumns.some((column) => String(values[column.dataIndex] ?? '').toLocaleLowerCase().includes(globalTerm)));
  });
}
