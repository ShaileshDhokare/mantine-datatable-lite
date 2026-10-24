import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { RowId, SelectionConfig, SelectionSnapshot } from '../types';
import type { RowEntry } from './useRowIdentity';

const NO_IDS: RowId[] = [];

/**
 * Controlled (`selectedIds`) or table-managed selection. Selection clears when
 * filters or searches change (`queryKey`); sorting and paging keep it.
 */
export function useSelection<T>(
  entries: RowEntry<T>[],
  selection: SelectionConfig<T> | undefined,
  queryKey: string,
) {
  const controlled = selection?.selectedIds !== undefined;
  const [local, setLocal] = useState({ ids: NO_IDS, queryKey });
  const selectedIds = controlled
    ? selection.selectedIds!
    : local.queryKey === queryKey
      ? local.ids
      : NO_IDS;
  const selectedSet = new Set(selectedIds);
  const pageIds = new Set(
    entries.flatMap(({ row, id }) =>
      id !== undefined && selection && (selection.isSelectable?.(row) ?? true)
        ? [id]
        : [],
    ),
  );
  const selectedOnPage = [...pageIds].filter((id) =>
    selectedSet.has(id),
  ).length;
  const allPageSelected = pageIds.size > 0 && selectedOnPage === pageIds.size;

  function snapshot(ids: RowId[]): SelectionSnapshot<T> {
    const set = new Set(ids);
    return {
      ids,
      loadedRows: entries
        .filter(({ id }) => id !== undefined && set.has(id))
        .map(({ row }) => row),
    };
  }
  function changeSelection(ids: RowId[]) {
    if (!controlled) setLocal({ ids, queryKey });
    selection?.onChange?.(snapshot(ids));
  }
  function togglePage() {
    changeSelection(
      allPageSelected
        ? selectedIds.filter((id) => !pageIds.has(id))
        : [...new Set([...selectedIds, ...pageIds])],
    );
  }

  // Table-managed selection is already empty for a new query; tell the caller.
  const previousQuery = useRef(queryKey);
  const reportCleared = useEffectEvent(() => {
    const previous = previousQuery.current;
    if (previous === queryKey) return;
    previousQuery.current = queryKey;
    const hadSelection = controlled
      ? selectedIds.length > 0
      : local.queryKey === previous && local.ids.length > 0;
    if (hadSelection) selection?.onChange?.(snapshot([]));
  });
  useEffect(() => {
    reportCleared();
  }, [queryKey]);

  return {
    selectedIds,
    selectedSet,
    pageIds,
    selectedOnPage,
    allPageSelected,
    snapshot,
    changeSelection,
    togglePage,
  };
}
