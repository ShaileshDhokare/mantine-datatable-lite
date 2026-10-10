import { useEffect, useMemo, useState } from 'react';
import type { DataTableColumn, PinnedColumns } from '../types';

export const CONTROL_COLUMN_WIDTH = 48;

type Measurements = {
  columns: Map<string, number>;
  selection: number;
  expansion: number;
};

export function useColumnLayout<T>(
  columns: DataTableColumn<T>[],
  hidden: string[],
  pinned: PinnedColumns,
  selection: boolean,
  expansion: boolean,
) {
  const [tableElement, tableRef] = useState<HTMLTableElement | null>(null);
  const [widths, setWidths] = useState<Measurements>({
    columns: new Map(),
    selection: 0,
    expansion: 0,
  });
  const { ordered, left, right } = useMemo(() => {
    const hiddenSet = new Set(hidden);
    const visible = columns.filter(
      (column) => !hiddenSet.has(column.dataIndex),
    );
    const byField = new Map(
      visible.map((column) => [column.dataIndex, column]),
    );
    const left = pinned.left.filter((field) => byField.has(field));
    const right = pinned.right.filter((field) => byField.has(field));
    const pinnedSet = new Set([...left, ...right]);
    return {
      left,
      right,
      ordered: [
        ...left.map((field) => byField.get(field)!),
        ...visible.filter((column) => !pinnedSet.has(column.dataIndex)),
        ...right.map((field) => byField.get(field)!),
      ],
    };
  }, [columns, hidden, pinned]);
  const headerSignature = JSON.stringify([
    ordered.map((column) => column.dataIndex),
    selection,
    expansion,
  ]);

  useEffect(() => {
    const table = tableElement;
    if (!table || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const next: Measurements = {
        columns: new Map(),
        selection: 0,
        expansion: 0,
      };
      table.querySelectorAll<HTMLElement>('thead th').forEach((cell) => {
        const width = cell.getBoundingClientRect().width;
        if (cell.dataset.column !== undefined)
          next.columns.set(cell.dataset.column, width);
        if (cell.dataset.control === 'selection') next.selection = width;
        if (cell.dataset.control === 'expansion') next.expansion = width;
      });
      setWidths((current) =>
        current.selection === next.selection &&
        current.expansion === next.expansion &&
        current.columns.size === next.columns.size &&
        [...next.columns].every(
          ([field, width]) => current.columns.get(field) === width,
        )
          ? current
          : next,
      );
    };
    const observer = new ResizeObserver(measure);
    table
      .querySelectorAll('thead th')
      .forEach((cell) => observer.observe(cell));
    measure();
    return () => observer.disconnect();
  }, [tableElement, headerSignature]);

  const selectionWidth = selection
    ? widths.selection || CONTROL_COLUMN_WIDTH
    : 0;
  const expansionWidth = expansion
    ? widths.expansion || CONTROL_COLUMN_WIDTH
    : 0;

  const offsets = useMemo(() => {
    const result = new Map<
      string,
      { side: 'left' | 'right'; offset: number }
    >();
    let start = selectionWidth + expansionWidth;
    for (const field of left) {
      const width = widths.columns.get(field);
      if (!width) break;
      result.set(field, { side: 'left', offset: start });
      start += width;
    }
    let end = 0;
    for (const field of [...right].reverse()) {
      const width = widths.columns.get(field);
      if (!width) break;
      result.set(field, { side: 'right', offset: end });
      end += width;
    }
    return result;
  }, [widths, left, right, selectionWidth, expansionWidth]);

  return {
    tableRef,
    ordered,
    offsets,
    left,
    right,
    expansionOffset: selectionWidth,
  };
}
