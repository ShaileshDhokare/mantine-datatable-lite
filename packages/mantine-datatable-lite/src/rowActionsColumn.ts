import type { ReactNode } from 'react';
import type { DataTableColumn } from './types';

/** A pinned column for per-row actions. Its clicks never trigger row click or expansion. */
export function rowActionsColumn<T>({
  render,
  header = 'Actions',
  width = 80,
  pinned = 'right',
}: {
  render: (row: T, index: number) => ReactNode;
  header?: ReactNode;
  width?: number;
  pinned?: 'left' | 'right';
}): DataTableColumn<T> {
  return {
    dataIndex: '__rowActions',
    header,
    width,
    pinned,
    render,
    sortable: false,
    filterable: false,
    searchable: false,
    hideable: false,
    pinnable: false,
    showMenu: false,
    stopRowClick: true,
  };
}
