import { useEffect, useEffectEvent, useRef } from 'react';
import type { RowId, SelectionConfig, SelectionSnapshot } from '../types';
import type { RowEntry } from './useRowIdentity';

export function useSelection<T>(
  entries: RowEntry<T>[],
  selection: SelectionConfig<T> | undefined,
  query: SelectionSnapshot<T>['query'],
) {
  const selectedIds = selection?.selectedIds ?? [];
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
      kind: 'include',
      ids,
      count: ids.length,
      query,
      loadedRows: entries
        .filter(({ id }) => id !== undefined && set.has(id))
        .map(({ row }) => row),
    };
  }
  function changeSelection(ids: RowId[]) {
    selection?.onChange(snapshot(ids));
  }
  function togglePage() {
    changeSelection(
      allPageSelected
        ? selectedIds.filter((id) => !pageIds.has(id))
        : [...new Set([...selectedIds, ...pageIds])],
    );
  }
  const querySignature = JSON.stringify(query);
  const previousQuery = useRef(querySignature);
  const resetForQuery = useEffectEvent(() => {
    if (previousQuery.current === querySignature) return;
    previousQuery.current = querySignature;
    if (selectedIds.length) changeSelection([]);
  });
  useEffect(() => {
    resetForQuery();
  }, [querySignature]);

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
