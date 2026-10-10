import type { DataTableColumn, FilterOption } from '../../types';

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});
const MAX_OPTIONS = 500;

function sentenceCase(value: string): string {
  const spaced = value.replace(/[_-]+/g, ' ').trim();
  return spaced
    ? spaced.charAt(0).toLocaleUpperCase() + spaced.slice(1)
    : value;
}

export function uniqueValues<T>(
  rows: T[],
  column: DataTableColumn<T>,
): FilterOption[] {
  if (column.filterOptions) {
    return column.filterOptions.map((option) =>
      typeof option === 'string'
        ? { value: option, label: sentenceCase(option) }
        : option,
    );
  }
  const values = new Set<string>();
  for (const row of rows) {
    const value = (row as Record<string, unknown>)[column.dataIndex];
    if (value === null || value === undefined) continue;
    values.add(String(value));
    if (values.size >= MAX_OPTIONS) break;
  }
  return [...values]
    .sort(collator.compare)
    .map((value) => ({ value, label: sentenceCase(value) }));
}
