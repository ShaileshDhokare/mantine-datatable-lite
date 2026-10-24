import type { SortOrder, Sorter } from '../../types';

export function nextSortOrder(
  current: Sorter | undefined,
  field: string,
): SortOrder | undefined {
  if (current?.field !== field) return 'asc';
  return current.order === 'asc' ? 'desc' : undefined;
}
