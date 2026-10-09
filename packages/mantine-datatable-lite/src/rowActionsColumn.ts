import type { ReactNode } from 'react';
import type { DataTableColumn } from './types';

export function rowActionsColumn<T>({
  render,
  header = 'Actions',
  width = 80,
  sticky = 'right',
}: {
  render: (row: T, index: number) => ReactNode;
  header?: ReactNode;
  width?: number;
  sticky?: 'left' | 'right';
}): DataTableColumn<T> {
  return {
    dataIndex: '__rowActions',
    header,
    width,
    sticky,
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
