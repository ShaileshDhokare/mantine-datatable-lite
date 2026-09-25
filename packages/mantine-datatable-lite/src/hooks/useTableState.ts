import { useEffect, useRef, useState } from 'react';
import type { DataTableProps, SortOrder, Sorter } from '../types';
import { nextSortOrder } from '../utils/nextSortOrder';

export function useTableState<T>({ columns, onChange, pagination, debounceTime = 300 }: Pick<DataTableProps<T>, 'columns' | 'onChange' | 'pagination' | 'debounceTime'>) {
  const [sorter, setSorter] = useState<Sorter | undefined>(() => {
    const column = columns.find((item) => item.sortable && item.defaultSortOrder);
    return column ? { sortField: column.dataIndex, sortOrder: column.defaultSortOrder! } : undefined;
  });
  const sorterRef = useRef(sorter);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const callbackRef = useRef(onChange);
  const paginationRef = useRef(pagination);
  callbackRef.current = onChange;
  paginationRef.current = pagination;

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function setSort(field: string, order?: SortOrder | null) {
    const current = sorterRef.current;
    const nextOrder = order === null ? undefined : order ?? nextSortOrder(current, field);
    const next = nextOrder ? { sortField: field, sortOrder: nextOrder } : undefined;
    sorterRef.current = next;
    setSorter(next);
    clearTimeout(timerRef.current);
    if (callbackRef.current) {
      timerRef.current = setTimeout(() => callbackRef.current?.({ pagination: paginationRef.current, sorter: next }), Math.max(0, debounceTime));
    }
  }

  return { sorter, setSort };
}
