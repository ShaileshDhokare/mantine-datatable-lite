import type { SortOrder, Sorter } from '../../types';

export function nextSortOrder(current: Sorter | undefined, field: string): SortOrder | undefined {
  if (current?.sortField !== field) return 'asc';
  return current.sortOrder === 'asc' ? 'desc' : undefined;
}
