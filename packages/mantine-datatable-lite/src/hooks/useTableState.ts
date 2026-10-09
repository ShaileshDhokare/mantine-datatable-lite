import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import type {
  ColumnSearch,
  DataTableProps,
  Filter,
  FilterValue,
  Pagination,
  SortOrder,
  Sorter,
} from '../types';
import {
  defaultColumnLayout,
  pruneColumnLayout,
  readColumnLayout,
  writeColumnLayout,
} from '../utils/columnLayoutStorage';
import { activeFilter } from '../utils/filter/predicates';
import { nextSortOrder } from '../utils/sort/nextSortOrder';
import { paginationChange, resolvePagination } from '../utils/pagination';

export function useTableState<T>({
  columns,
  onChange,
  pagination,
  persistKey,
  debounceTime = 300,
}: Pick<
  DataTableProps<T>,
  'columns' | 'onChange' | 'pagination' | 'persistKey' | 'debounceTime'
>) {
  const [sorter, setSorter] = useState<Sorter | undefined>(() => {
    const column = columns.find(
      (item) => item.sortable && item.defaultSortOrder,
    );
    return column
      ? { sortField: column.dataIndex, sortOrder: column.defaultSortOrder! }
      : undefined;
  });
  const [filters, setFilters] = useState<Filter[]>(() =>
    columns.flatMap((column) =>
      column.filterable && activeFilter(column.defaultFilterValue)
        ? [{ field: column.dataIndex, value: column.defaultFilterValue! }]
        : [],
    ),
  );
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [columnSearch, setColumnSearchState] = useState<ColumnSearch[]>(() =>
    columns.flatMap((column) =>
      column.searchable && column.defaultSearchValue?.trim()
        ? [
            {
              searchField: column.dataIndex,
              searchValue: column.defaultSearchValue.trim(),
            },
          ]
        : [],
    ),
  );
  const [openSearch, setOpenSearch] = useState<string | null>(null);
  const [searchQuery, setSearchQueryState] = useState('');
  const [layout, setLayout] = useState(() => defaultColumnLayout(columns));
  const [loadedKey, setLoadedKey] = useState<string>();
  const validLayout = pruneColumnLayout(layout, columns);
  const layoutSignature = JSON.stringify(layout);
  const validLayoutSignature = JSON.stringify(validLayout);
  const { hiddenColumns, pinned } = validLayout;
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

  const loadLayout = useEffectEvent((key: string | undefined) => {
    setLayout(
      key
        ? (readColumnLayout(key, columns) ?? defaultColumnLayout(columns))
        : defaultColumnLayout(columns),
    );
    setLoadedKey(key);
  });
  useEffect(() => {
    // Changing columns prunes the current layout; only a new key loads saved defaults.
    loadLayout(persistKey);
  }, [persistKey]);

  const reconcileLayout = useEffectEvent(() => setLayout(validLayout));
  useEffect(() => {
    if (layoutSignature !== validLayoutSignature) reconcileLayout();
  }, [layoutSignature, validLayoutSignature]);

  const saveLayout = useEffectEvent((key: string) =>
    writeColumnLayout(key, validLayout),
  );
  useEffect(() => {
    if (persistKey && loadedKey === persistKey) saveLayout(persistKey);
  }, [persistKey, loadedKey, validLayoutSignature]);

  const notify = useCallback(
    (
      nextSorter: Sorter | undefined,
      nextFilters: Filter[],
      immediate = false,
      nextPagination?: Pagination,
    ) => {
      clearTimeout(timerRef.current);
      if (callbackRef.current) {
        const requestedPagination = nextPagination ?? paginationRef.current;
        const snapshot = {
          pagination: requestedPagination
            ? paginationChange(requestedPagination)
            : undefined,
          sorter: nextSorter,
          filters: nextFilters,
          columnSearch: columnSearchRef.current,
          searchQuery: searchQueryRef.current,
        };
        if (immediate) callbackRef.current(snapshot);
        else
          timerRef.current = setTimeout(
            () => callbackRef.current?.(snapshot),
            Math.max(0, debounceTime),
          );
      }
    },
    [debounceTime],
  );

  const columnSignature = JSON.stringify(
    columns.map(({ dataIndex, sortable, filterable, searchable }) => [
      dataIndex,
      Boolean(sortable),
      Boolean(filterable),
      searchable === true,
    ]),
  );
  const reconcileDataState = useEffectEvent(() => {
    const byField = new Map(
      columns.map((column) => [column.dataIndex, column]),
    );
    const currentSort = sorterRef.current;
    const nextSorter =
      currentSort && byField.get(currentSort.sortField)?.sortable
        ? currentSort
        : undefined;
    const nextFilters = filtersRef.current.filter(
      (filter) => byField.get(filter.field)?.filterable,
    );
    const nextSearch = columnSearchRef.current.filter(
      (search) => byField.get(search.searchField)?.searchable === true,
    );
    if (openFilter && !byField.get(openFilter)?.filterable) setOpenFilter(null);
    if (openSearch && byField.get(openSearch)?.searchable !== true)
      setOpenSearch(null);
    if (
      nextSorter === currentSort &&
      nextFilters.length === filtersRef.current.length &&
      nextSearch.length === columnSearchRef.current.length
    )
      return;
    sorterRef.current = nextSorter;
    filtersRef.current = nextFilters;
    columnSearchRef.current = nextSearch;
    setSorter(nextSorter);
    setFilters(nextFilters);
    setColumnSearchState(nextSearch);
    notify(nextSorter, nextFilters, false, resetPage());
  });
  useEffect(() => {
    reconcileDataState();
  }, [columnSignature]);

  function setSort(field: string, order?: SortOrder | null) {
    const current = sorterRef.current;
    const nextOrder =
      order === null ? undefined : (order ?? nextSortOrder(current, field));
    const next = nextOrder
      ? { sortField: field, sortOrder: nextOrder }
      : undefined;
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
    const next = columnSearchRef.current.filter(
      (search) => search.searchField !== field,
    );
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
    const column = columns.find((item) => item.dataIndex === field);
    if (!column || (hidden && column.hideable === false)) return;
    const next = hidden
      ? [...new Set([...hiddenColumns, field])]
      : hiddenColumns.filter((item) => item !== field);
    setHiddenColumns(next);
  }

  function setHiddenColumns(fields: string[]) {
    setLayout((current) =>
      pruneColumnLayout(
        {
          hiddenColumns: fields,
          pinned: current.pinned,
        },
        columns,
      ),
    );
  }

  function pinColumn(field: string, side: 'left' | 'right' | null) {
    if (
      columns.find((column) => column.dataIndex === field)?.pinnable === false
    )
      return;
    setLayout((current) =>
      pruneColumnLayout(
        {
          hiddenColumns: current.hiddenColumns,
          pinned: {
            left:
              side === 'left'
                ? [
                    ...current.pinned.left.filter((item) => item !== field),
                    field,
                  ]
                : current.pinned.left.filter((item) => item !== field),
            right:
              side === 'right'
                ? [
                    ...current.pinned.right.filter((item) => item !== field),
                    field,
                  ]
                : current.pinned.right.filter((item) => item !== field),
          },
        },
        columns,
      ),
    );
  }

  function movePinned(field: string, direction: -1 | 1) {
    setLayout((current) => {
      const side = current.pinned.left.includes(field)
        ? 'left'
        : current.pinned.right.includes(field)
          ? 'right'
          : null;
      if (!side) return current;
      const items = [...current.pinned[side]];
      const from = items.indexOf(field);
      const to = from + direction;
      if (to < 0 || to >= items.length) return current;
      [items[from], items[to]] = [items[to], items[from]];
      return { ...current, pinned: { ...current.pinned, [side]: items } };
    });
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
    setLayout({ hiddenColumns: [], pinned: { left: [], right: [] } });
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

  function setPagination(
    currentPage: number,
    pageSize = paginationRef.current?.pageSize,
  ) {
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
    const { pageSize, currentPage: clampedPage } =
      resolvePagination(pagination);
    const key = `${pagination.currentPage}:${pageSize}:${pagination.totalItems}`;
    if (clampedPage === pagination.currentPage) lastClampRef.current = null;
    if (
      clampedPage !== pagination.currentPage &&
      lastClampRef.current !== key
    ) {
      lastClampRef.current = key;
      const next = { ...pagination, currentPage: clampedPage };
      delete next.from;
      delete next.to;
      notify(sorterRef.current, filtersRef.current, true, next);
    }
  }, [pagination, onChange, notify]);

  return {
    sorter,
    setSort,
    filters,
    setFilter,
    openFilter,
    setOpenFilter,
    columnSearch,
    setColumnSearch,
    openSearch,
    setOpenSearch,
    searchQuery,
    setSearchQuery,
    hiddenColumns,
    setHiddenColumns,
    setColumnHidden,
    pinned,
    pinColumn,
    movePinned,
    clearAll,
    resetVersion,
    setPagination,
  };
}
