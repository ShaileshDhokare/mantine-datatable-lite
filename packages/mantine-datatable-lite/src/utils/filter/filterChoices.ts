import type { DataTableColumn, DataTableLabels, FilterOption } from '../../types';
import { columnValue } from '../columnValue';

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});
const MAX_OPTIONS = 500;

/** Filter choices: supplied options, or distinct values from the rows. */
export function filterChoices<T>(
  rows: T[],
  column: DataTableColumn<T>,
  labels: Pick<DataTableLabels, 'true' | 'false'>,
  fromRows: boolean,
): FilterOption[] {
  if (column.filterOptions) {
    return column.filterOptions.map((option) =>
      typeof option === 'string' ? { value: option, label: option } : option,
    );
  }
  if (column.type === 'boolean') {
    return [
      { value: 'true', label: labels.true },
      { value: 'false', label: labels.false },
    ];
  }
  if (!fromRows) return [];
  const values = new Set<string>();
  for (const row of rows) {
    const value = columnValue(column, row);
    if (value === null || value === undefined) continue;
    values.add(String(value));
    if (values.size >= MAX_OPTIONS) break;
  }
  return [...values]
    .sort(collator.compare)
    .map((value) => ({ value, label: value }));
}
