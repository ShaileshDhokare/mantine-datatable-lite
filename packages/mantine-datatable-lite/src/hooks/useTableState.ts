import { useEffect, useRef, useState } from 'react';
import type { ColumnSearch, DataTableProps, Filter, FilterValue, Pagination, PaginationChange, SortOrder, Sorter } from '../types';
import { activeFilter } from '../utils/filter/predicates';
import { nextSortOrder } from '../utils/sort/nextSortOrder';

function paginationChange(pagination: Pagination): PaginationChange {
  const { currentPage, totalItems } = pagination;
  const pageSize = pagination.pageSize > 0 ? pagination.pageSize : pagination.defaultPageSize || 10;
  return {
    currentPage, pageSize, totalItems,
    from: totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1,
    to: totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems),
  };
}

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
  const [columnSearch, setColumnSearchState] = useState<ColumnSearch[]>(() => columns.flatMap((column) =>
    column.searchable && column.defaultSearchValue?.trim()
      ? [{ searchField: column.dataIndex, searchValue: column.defaultSearchValue.trim() }]
      : [],
  ));
  const [openSearch, setOpenSearch] = useState<string | null>(null);
  const [searchQuery, setSearchQueryState] = useState('');
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [resetVersion, setResetVersion] = useState(0);
  const sorterRef = useRef(sorter);
  const filtersRef = useRef(filters);
  const columnSearchRef = useRef(columnSearch);
  const searchQueryRef = useRef(searchQuery);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const callbackRef = useRef(onChange);
  const paginationRef = useRef(pagination);
  const lastClampRef = useRef<string | null>(null);
  callbackRef.current = onChange;
  paginationRef.current = pagination;

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function notify(nextSorter: Sorter | undefined, nextFilters: Filter[], immediate = false, nextPagination?: Pagination) {
    clearTimeout(timerRef.current);
    if (callbackRef.current) {
      const requestedPagination = nextPagination ?? paginationRef.current;
      const snapshot = {
        pagination: requestedPagination ? paginationChange(requestedPagination) : undefined,
        sorter: nextSorter,
        filters: nextFilters,
        columnSearch: columnSearchRef.current,
        searchQuery: searchQueryRef.current,
      };
      if (immediate) callbackRef.current(snapshot);
      else timerRef.current = setTimeout(() => callbackRef.current?.(snapshot), Math.max(0, debounceTime));
    }
  }

  function setSort(field: string, order?: SortOrder | null) {
    const current = sorterRef.current;
    const nextOrder = order === null ? undefined : order ?? nextSortOrder(current, field);
    const next = nextOrder ? { sortField: field, sortOrder: nextOrder } : undefined;
    sorterRef.current = next;
    setSorter(next);
    notify(next, filtersRef.current, false, resetPage());
  }

  function setFilter(field: string, value?: FilterValue) {
    const next = filtersRef.current.filter((filter) => filter.field !== field);
    if (value && activeFilter(value)) next.push({ field, value });
    filtersRef.current = next;
    setFilters(next);
    setOpenFilter(null);
    notify(sorterRef.current, next, false, resetPage());
  }

  function setColumnSearch(field: string, value: string) {
    const next = columnSearchRef.current.filter((search) => search.searchField !== field);
    const trimmed = value.trim();
    if (trimmed) next.push({ searchField: field, searchValue: trimmed });
    columnSearchRef.current = next;
    setColumnSearchState(next);
    setOpenSearch(null);
    notify(sorterRef.current, filtersRef.current, false, resetPage());
  }

  function setSearchQuery(value: string, immediate = false) {
    searchQueryRef.current = value.trim();
    setSearchQueryState(value.trim());
    notify(sorterRef.current, filtersRef.current, immediate, resetPage());
  }

  function setColumnHidden(field: string, hidden: boolean) {
    setHiddenColumns((current) => hidden
      ? current.includes(field) ? current : [...current, field]
      : current.filter((item) => item !== field));
  }

  function clearAll() {
    sorterRef.current = undefined;
    filtersRef.current = [];
    columnSearchRef.current = [];
    searchQueryRef.current = '';
    setSorter(undefined);
    setFilters([]);
    setColumnSearchState([]);
    setSearchQueryState('');
    setHiddenColumns([]);
    setResetVersion((version) => version + 1);
    setOpenFilter(null);
    setOpenSearch(null);
    notify(undefined, [], false, resetPage());
  }

  function resetPage() {
    const current = paginationRef.current;
    if (!current) return undefined;
    const next = { ...current, currentPage: 1 };
    delete next.from;
    delete next.to;
    paginationRef.current = next;
    return next;
  }

  function setPagination(currentPage: number, pageSize = paginationRef.current?.pageSize) {
    const current = paginationRef.current;
    if (!current || !pageSize) return;
    const next: Pagination = { ...current, currentPage, pageSize };
    delete next.from;
    delete next.to;
    paginationRef.current = next;
    notify(sorterRef.current, filtersRef.current, true, next);
  }

  useEffect(() => {
    if (!pagination || !onChange) return;
    const pageSize = pagination.pageSize > 0 ? pagination.pageSize : pagination.defaultPageSize || 10;
    const lastPage = Math.max(1, Math.ceil(pagination.totalItems / pageSize));
    const clampedPage = Math.min(Math.max(1, pagination.currentPage), lastPage);
    const key = `${pagination.currentPage}:${pageSize}:${pagination.totalItems}`;
    if (clampedPage === pagination.currentPage) lastClampRef.current = null;
    if (clampedPage !== pagination.currentPage && lastClampRef.current !== key) {
      lastClampRef.current = key;
      const next = { ...pagination, currentPage: clampedPage };
      delete next.from;
      delete next.to;
      notify(sorterRef.current, filtersRef.current, true, next);
    }
  }, [pagination?.currentPage, pagination?.pageSize, pagination?.totalItems, onChange]);

  return { sorter, setSort, filters, setFilter, openFilter, setOpenFilter,
    columnSearch, setColumnSearch, openSearch, setOpenSearch, searchQuery, setSearchQuery,
    hiddenColumns, setHiddenColumns, setColumnHidden, clearAll, resetVersion, setPagination };
}
