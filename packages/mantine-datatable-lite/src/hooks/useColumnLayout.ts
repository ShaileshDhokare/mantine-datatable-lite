import { useEffect, useMemo, useRef, useState } from 'react';
import type { DataTableColumn, PinnedColumns } from '../types';

export function useColumnLayout<T>(columns: DataTableColumn<T>[], hidden: string[], pinned: PinnedColumns) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [widths, setWidths] = useState<Record<string, number>>({});
  const visible = columns.filter((column) => !hidden.includes(column.dataIndex));
  const left = pinned.left.filter((field) => visible.some((column) => column.dataIndex === field));
  const right = pinned.right.filter((field) => visible.some((column) => column.dataIndex === field));
  const ordered = [
    ...left.map((field) => visible.find((column) => column.dataIndex === field)!),
    ...visible.filter((column) => !left.includes(column.dataIndex) && !right.includes(column.dataIndex)),
    ...right.map((field) => visible.find((column) => column.dataIndex === field)!),
  ];

  useEffect(() => {
    const table = tableRef.current;
    if (!table || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const next: Record<string, number> = {};
      table.querySelectorAll<HTMLElement>('thead th[data-column]').forEach((cell) => {
        next[cell.dataset.column!] = cell.getBoundingClientRect().width;
      });
      setWidths((current) => Object.keys(next).every((key) => current[key] === next[key]) &&
        Object.keys(current).length === Object.keys(next).length ? current : next);
    };
    const observer = new ResizeObserver(measure);
    table.querySelectorAll('thead th[data-column]').forEach((cell) => observer.observe(cell));
    measure();
    return () => observer.disconnect();
  }, [ordered.map((column) => column.dataIndex).join('|')]);

  const offsets = useMemo(() => {
    const result: Record<string, { side: 'left' | 'right'; offset: number }> = {};
    let start = 0;
    for (const field of left) {
      if (!widths[field]) break;
      result[field] = { side: 'left', offset: start };
      start += widths[field];
    }
    let end = 0;
    for (const field of [...right].reverse()) {
      if (!widths[field]) break;
      result[field] = { side: 'right', offset: end };
      end += widths[field];
    }
    return result;
  }, [widths, left.join('|'), right.join('|')]);

  return { tableRef, ordered, offsets, left, right };
}
