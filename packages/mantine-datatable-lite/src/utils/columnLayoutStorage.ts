import type { DataTableColumn, PinnedColumns } from '../types';

export type ColumnLayout = {
  hiddenColumns: string[];
  pinned: PinnedColumns;
};

export function defaultColumnLayout<T>(columns: DataTableColumn<T>[]): ColumnLayout {
  return {
    hiddenColumns: [],
    pinned: {
      left: columns.filter((column) => column.sticky === 'left').map((column) => column.dataIndex),
      right: columns.filter((column) => column.sticky === 'right').map((column) => column.dataIndex),
    },
  };
}

export function pruneColumnLayout<T>(layout: ColumnLayout, columns: DataTableColumn<T>[]): ColumnLayout {
  const known = new Map(columns.map((column) => [column.dataIndex, column]));
  const hiddenColumns = [...new Set(layout.hiddenColumns)].filter((field) =>
    known.get(field)?.hideable !== false && known.has(field));
  if (columns.length > 0 && hiddenColumns.length === columns.length) hiddenColumns.pop();
  const visible = new Set(columns.map((column) => column.dataIndex).filter((field) => !hiddenColumns.includes(field)));
  const allowed = (field: string, side: 'left' | 'right') => {
    const column = known.get(field);
    return visible.has(field) && column && (column.pinnable !== false || column.sticky === side);
  };
  const left = [...new Set(layout.pinned.left)].filter((field) => allowed(field, 'left'));
  const right = [...new Set(layout.pinned.right)].filter((field) => !left.includes(field) && allowed(field, 'right'));
  return { hiddenColumns, pinned: { left, right } };
}

export function readColumnLayout<T>(key: string, columns: DataTableColumn<T>[]): ColumnLayout | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !('v' in parsed) || parsed.v !== 1 ||
      !('data' in parsed) || !parsed.data || typeof parsed.data !== 'object') return undefined;
    const data = parsed.data;
    if (!('hiddenColumns' in data) || !Array.isArray(data.hiddenColumns) ||
      !data.hiddenColumns.every((field: unknown) => typeof field === 'string') ||
      !('pinned' in data) || !data.pinned || typeof data.pinned !== 'object' ||
      !('left' in data.pinned) || !Array.isArray(data.pinned.left) ||
      !data.pinned.left.every((field: unknown) => typeof field === 'string') ||
      !('right' in data.pinned) || !Array.isArray(data.pinned.right) ||
      !data.pinned.right.every((field: unknown) => typeof field === 'string')) return undefined;
    return pruneColumnLayout(data as ColumnLayout, columns);
  } catch {
    return undefined;
  }
}

export function writeColumnLayout(key: string, layout: ColumnLayout) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify({ v: 1, data: layout }));
  } catch {
    // Storage can be unavailable or full; the table keeps working in memory.
  }
}
