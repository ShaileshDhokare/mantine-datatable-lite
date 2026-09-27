import { useEffect, useRef, useState } from 'react';
import type { DataTableProps, Filter, FilterValue, SortOrder, Sorter } from '../types';
import { activeFilter } from '../utils/filter/predicates';
import { nextSortOrder } from '../utils/sort/nextSortOrder';

export function useTableState<T>({ columns, onChange, pagination, debounceTime = 300 }: Pick<DataTableProps<T>, 'columns' | 'onChange' | 'pagination' | 'debounceTime'>) {
  const [sorter, setSorter] = useState<Sorter | undefined>(() => {
    const column = columns.find((item) => item.sortable && item.defaultSortOrder);
    return column ? { sortField: column.dataIndex, sortOrder: column.defaultSortOrder! } : undefined;
  });
  const [filters, setFilters] = useState<Filter[]>(() => columns.flatMap((column) =>
    column.filterable && activeFilter(column.defaultFilterValue)
      ? [{ field: column.dataIndex, value: column.defaultFilterValue! }]
      : [],
  ));
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const sorterRef = useRef(sorter);
  const filtersRef = useRef(filters);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const callbackRef = useRef(onChange);
  const paginationRef = useRef(pagination);
  callbackRef.current = onChange;
  paginationRef.current = pagination;

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function notify(nextSorter: Sorter | undefined, nextFilters: Filter[]) {
    clearTimeout(timerRef.current);
    if (callbackRef.current) {
      timerRef.current = setTimeout(() => callbackRef.current?.({
        pagination: paginationRef.current,
        sorter: nextSorter,
        filters: nextFilters,
      }), Math.max(0, debounceTime));
    }
  }

  function setSort(field: string, order?: SortOrder | null) {
    const current = sorterRef.current;
    const nextOrder = order === null ? undefined : order ?? nextSortOrder(current, field);
    const next = nextOrder ? { sortField: field, sortOrder: nextOrder } : undefined;
    sorterRef.current = next;
    setSorter(next);
    notify(next, filtersRef.current);
  }

  function setFilter(field: string, value?: FilterValue) {
    const next = filtersRef.current.filter((filter) => filter.field !== field);
    if (value && activeFilter(value)) next.push({ field, value });
    filtersRef.current = next;
    setFilters(next);
    setOpenFilter(null);
    notify(sorterRef.current, next);
  }

  return { sorter, setSort, filters, setFilter, openFilter, setOpenFilter };
}
