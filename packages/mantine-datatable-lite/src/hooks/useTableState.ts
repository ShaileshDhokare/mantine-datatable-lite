import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type {
  ColumnSearch,
  DataTableColumn,
  Filter,
  FilterValue,
  Pagination,
  SortOrder,
  Sorter,
  TableChange,
} from '../types';
import {
  defaultColumnLayout,
  pruneColumnLayout,
  readColumnLayout,
  writeColumnLayout,
} from '../utils/columnLayoutStorage';
import { activeFilter } from '../utils/filter/predicates';
import { nextSortOrder } from '../utils/sort/nextSortOrder';
import { DEFAULT_PAGE_SIZE, resolvePage } from '../utils/pagination';

type Snapshot = {
  sorter: Sorter | undefined;
  filters: Filter[];
  columnSearch: ColumnSearch[];
  searchQuery: string;
  page: number;
  pageSize: number;
};

function initialSorter<T>(columns: DataTableColumn<T>[]): Sorter | undefined {
  const column = columns.find((item) => item.sortable && item.defaultSortOrder);
  return column
    ? { field: column.dataIndex, order: column.defaultSortOrder! }
    : undefined;
}

function initialFilters<T>(columns: DataTableColumn<T>[]): Filter[] {
  return columns.flatMap((column) =>
    column.filterable && activeFilter(column.defaultFilterValue)
      ? [{ field: column.dataIndex, value: column.defaultFilterValue! }]
      : [],
  );
}

function initialColumnSearch<T>(columns: DataTableColumn<T>[]): ColumnSearch[] {
  return columns.flatMap((column) =>
    column.searchable && column.defaultSearchValue?.trim()
      ? [{ field: column.dataIndex, value: column.defaultSearchValue.trim() }]
      : [],
  );
}

/** Returns the same array when nothing is removed, so memoized consumers stay stable. */
function keep<V>(items: V[], predicate: (item: V) => boolean): V[] {
  const kept = items.filter(predicate);
  return kept.length === items.length ? items : kept;
}

function queryKey(state: Snapshot) {
  return JSON.stringify([
    state.sorter,
    state.filters,
    state.columnSearch,
    state.searchQuery,
  ]);
}

export function useTableState<T>({
  columns,
  mode,
  pagination,
  onChange,
  persistKey,
}: {
  columns: DataTableColumn<T>[];
  mode: 'client' | 'server';
  /** Normalized pagination config; undefined when pagination is off. */
  pagination: Pagination | undefined;
  onChange?: (params: TableChange) => void;
  persistKey?: string;
}) {
  const server = mode === 'server';
  const [sorterState, setSorter] = useState(() => initialSorter(columns));
  const [filtersState, setFilters] = useState(() => initialFilters(columns));
  const [columnSearchState, setColumnSearchState] = useState(() =>
    initialColumnSearch(columns),
  );
  const [searchQuery, setSearchQueryState] = useState('');
  const [clientPage, setClientPage] = useState(
    () => pagination?.currentPage ?? 1,
  );
  const [clientPageSize, setClientPageSize] = useState(
    () => pagination?.pageSize ?? DEFAULT_PAGE_SIZE,
  );
  const [layout, setLayout] = useState(() => defaultColumnLayout(columns));
  const [loadedKey, setLoadedKey] = useState<string>();
  const [resetVersion, setResetVersion] = useState(0);

  // Effective state: entries for removed or disabled columns are ignored.
  const byField = new Map(columns.map((column) => [column.dataIndex, column]));
  const sorter =
    sorterState && byField.get(sorterState.field)?.sortable
      ? sorterState
      : undefined;
  const filters = keep(
    filtersState,
    (filter) => byField.get(filter.field)?.filterable === true,
  );
  const columnSearch = keep(
    columnSearchState,
    (search) => byField.get(search.field)?.searchable === true,
  );
  const validLayout = pruneColumnLayout(layout, columns);
  const validLayoutSignature = JSON.stringify(validLayout);
  const { hiddenColumns, pinned } = validLayout;

  const page = server ? (pagination?.currentPage ?? 1) : clientPage;
  const pageSize = server
    ? (pagination?.pageSize ?? DEFAULT_PAGE_SIZE)
    : clientPageSize;
  const totalItems = pagination?.totalItems;
  const current: Snapshot = {
    sorter,
    filters,
    columnSearch,
    searchQuery,
    page,
    pageSize,
  };
  const currentQueryKey = queryKey(current);

  function toChange(state: Snapshot): TableChange {
    const resolved =
      server && totalItems !== undefined
        ? resolvePage(state.page, state.pageSize, totalItems)
        : undefined;
    return {
      pagination: pagination
        ? {
            currentPage: resolved?.currentPage ?? state.page,
            pageSize: resolved?.pageSize ?? state.pageSize,
          }
        : undefined,
      sorter: state.sorter,
      filters: state.filters,
      columnSearch: state.columnSearch,
      searchQuery: state.searchQuery,
    };
  }

  // The query last reported through onChange; null until the first server request.
  const reportedQuery = useRef<string | null>(server ? null : currentQueryKey);
  const lastClamp = useRef<string | null>(null);

  function commit(next: Snapshot) {
    reportedQuery.current = queryKey(next);
    onChange?.(toChange(next));
  }

  function commitQuery(next: Snapshot) {
    if (!server) setClientPage(1);
    commit({ ...next, page: 1 });
  }

  // Reports the initial server request, and requests dropped by column changes.
  const reportQuery = useEffectEvent(() => {
    if (reportedQuery.current === currentQueryKey) return;
    const initial = reportedQuery.current === null;
    reportedQuery.current = currentQueryKey;
    onChange?.(toChange(initial ? current : { ...current, page: 1 }));
  });
  useEffect(() => {
    reportQuery();
  }, [currentQueryKey]);

  // A shrinking server total moves the request to the last available page.
  const reportClamp = useEffectEvent(() => {
    if (!server || !pagination || totalItems === undefined) return;
    const { currentPage } = resolvePage(page, pageSize, totalItems);
    if (currentPage === page) {
      lastClamp.current = null;
      return;
    }
    const key = `${page}:${pageSize}:${totalItems}`;
    if (lastClamp.current === key) return;
    lastClamp.current = key;
    onChange?.(toChange(current));
  });
  useEffect(() => {
    reportClamp();
  }, [page, pageSize, totalItems]);

  const loadLayout = useEffectEvent((key: string | undefined) => {
    setLayout(
      key
        ? (readColumnLayout(key, columns) ?? defaultColumnLayout(columns))
        : defaultColumnLayout(columns),
    );
    setLoadedKey(key);
  });
  useEffect(() => {
    // Read storage after mount so server-rendered markup matches the first client render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLayout(persistKey);
  }, [persistKey]);

  const saveLayout = useEffectEvent((key: string) =>
    writeColumnLayout(key, validLayout),
  );
  useEffect(() => {
    if (persistKey && loadedKey === persistKey) saveLayout(persistKey);
  }, [persistKey, loadedKey, validLayoutSignature]);

  function setSort(field: string, order?: SortOrder | null) {
    const nextOrder =
      order === null ? undefined : (order ?? nextSortOrder(sorter, field));
    const next = nextOrder ? { field, order: nextOrder } : undefined;
    setSorter(next);
    commitQuery({ ...current, sorter: next });
  }

  function setFilter(field: string, value?: FilterValue) {
    const next = filters.filter((filter) => filter.field !== field);
    if (value && activeFilter(value)) next.push({ field, value });
    setFilters(next);
    commitQuery({ ...current, filters: next });
  }

  function setColumnSearch(field: string, value: string) {
    const next = columnSearch.filter((search) => search.field !== field);
    const trimmed = value.trim();
    if (trimmed) next.push({ field, value: trimmed });
    setColumnSearchState(next);
    commitQuery({ ...current, columnSearch: next });
  }

  function setSearchQuery(value: string) {
    const trimmed = value.trim();
    if (trimmed === searchQuery) return;
    setSearchQueryState(trimmed);
    commitQuery({ ...current, searchQuery: trimmed });
  }

  function setPagination(nextPage: number, nextPageSize = pageSize) {
    if (!pagination) return;
    if (!server) {
      setClientPage(nextPage);
      setClientPageSize(nextPageSize);
    }
    commit({ ...current, page: nextPage, pageSize: nextPageSize });
  }

  function setColumnHidden(field: string, hidden: boolean) {
    const column = byField.get(field);
    if (!column || (hidden && column.hideable === false)) return;
    setHiddenColumns(
      hidden
        ? [...new Set([...hiddenColumns, field])]
        : hiddenColumns.filter((item) => item !== field),
    );
  }

  function setHiddenColumns(fields: string[]) {
    setLayout((state) =>
      pruneColumnLayout(
        { hiddenColumns: fields, pinned: state.pinned },
        columns,
      ),
    );
  }

  function pinColumn(field: string, side: 'left' | 'right' | null) {
    if (byField.get(field)?.pinnable === false) return;
    setLayout((state) => {
      const without = (items: string[]) =>
        items.filter((item) => item !== field);
      return pruneColumnLayout(
        {
          hiddenColumns: state.hiddenColumns,
          pinned: {
            left:
              side === 'left'
                ? [...without(state.pinned.left), field]
                : without(state.pinned.left),
            right:
              side === 'right'
                ? [...without(state.pinned.right), field]
                : without(state.pinned.right),
          },
        },
        columns,
      );
    });
  }

  function movePinned(field: string, direction: -1 | 1) {
    setLayout((state) => {
      const side = state.pinned.left.includes(field)
        ? 'left'
        : state.pinned.right.includes(field)
          ? 'right'
          : null;
      if (!side) return state;
      const items = [...state.pinned[side]];
      const from = items.indexOf(field);
      const to = from + direction;
      if (to < 0 || to >= items.length) return state;
      [items[from], items[to]] = [items[to], items[from]];
      return { ...state, pinned: { ...state.pinned, [side]: items } };
    });
  }

  function clearAll() {
    setSorter(undefined);
    setFilters([]);
    setColumnSearchState([]);
    setSearchQueryState('');
    setLayout(defaultColumnLayout(columns));
    setResetVersion((version) => version + 1);
    commitQuery({
      ...current,
      sorter: undefined,
      filters: [],
      columnSearch: [],
      searchQuery: '',
    });
  }

  return {
    sorter,
    setSort,
    filters,
    setFilter,
    columnSearch,
    setColumnSearch,
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
    page,
    pageSize,
    setPagination,
  };
}

export type TableState = ReturnType<typeof useTableState>;
