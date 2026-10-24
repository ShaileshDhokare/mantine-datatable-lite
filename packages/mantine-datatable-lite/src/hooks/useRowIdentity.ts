import { useEffect, useMemo, useRef } from 'react';
import type { IdAccessor, RowId } from '../types';

export function rowIdKey(id: RowId): string {
  return `${typeof id}:${String(id)}`;
}

export function rowPanelId(prefix: string, id: RowId): string {
  const encoded = Array.from(String(id), (character) =>
    character.codePointAt(0)!.toString(16),
  ).join('-');
  return `${prefix}-panel-${typeof id}-${encoded}`;
}

export type RowEntry<T> = { row: T; id: RowId | undefined; key: string };

// Stable keys for row objects without a usable ID. A WeakMap keyed by the row object,
// so keys follow rows through sorting and never leak.
const fallbackKeys = new WeakMap<object, number>();
let nextFallbackKey = 0;
function fallbackKeyFor(row: object): number {
  let key = fallbackKeys.get(row);
  if (key === undefined) {
    key = nextFallbackKey++;
    fallbackKeys.set(row, key);
  }
  return key;
}

export function useRowIdentity<T>(
  rows: T[],
  idAccessor: IdAccessor<T> | undefined,
  interactive: boolean,
) {
  const warned = useRef(new Set<string>());
  const { entries, problems } = useMemo(() => {
    const ids = rows.map((row) => {
      const id: unknown =
        typeof idAccessor === 'function'
          ? idAccessor(row)
          : row == null
            ? undefined
            : (row as Record<PropertyKey, unknown>)[idAccessor ?? 'id'];
      return typeof id === 'string' ||
        (typeof id === 'number' && Number.isFinite(id))
        ? id
        : undefined;
    });
    const counts = new Map<RowId, number>();
    for (const id of ids)
      if (id !== undefined) counts.set(id, (counts.get(id) ?? 0) + 1);
    const problems = new Set<string>();
    const occurrences = new Map<string, number>();
    const entries: RowEntry<T>[] = rows.map((row, index) => {
      const candidate = ids[index];
      const duplicate = candidate !== undefined && counts.get(candidate)! > 1;
      if (duplicate)
        problems.add(
          `Duplicate row ID ${rowIdKey(candidate)}. Use unique IDs.`,
        );
      if (candidate === undefined && interactive)
        problems.add(
          'Selection and expansion require a stable string or finite numeric row ID. Set idAccessor or provide row.id.',
        );
      const id = duplicate ? undefined : candidate;
      if (id !== undefined) return { row, id, key: `row:${rowIdKey(id)}` };
      const fallback =
        typeof row === 'object' && row !== null ? fallbackKeyFor(row) : index;
      const base = `fallback:${typeof row === 'object' && row !== null ? 'object' : 'position'}:${fallback}`;
      const occurrence = occurrences.get(base) ?? 0;
      occurrences.set(base, occurrence + 1);
      return { row, id, key: `${base}:${occurrence}` };
    });
    return { entries, problems };
  }, [rows, idAccessor, interactive]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    for (const message of problems) {
      if (!warned.current.has(message)) {
        warned.current.add(message);
        console.warn(
          `[DataTable] ${message} Row selection/expansion is disabled for affected rows.`,
        );
      }
    }
  }, [problems]);
  return entries;
}
