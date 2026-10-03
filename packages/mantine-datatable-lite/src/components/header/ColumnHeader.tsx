import { columnLabel } from '../../utils/columnLabel';
import { ActionIcon, Box, Group, Table } from '@mantine/core';
import { useDataTableContext } from '../../context/DataTableContext';
import { Icon } from '../../icons/Icon';
import type { DataTableColumn } from '../../types';
import classes from '../../styles/styles.module.css';
import type { CSSProperties } from 'react';
import { ColumnMenu } from './ColumnMenu';
import { FilterPopover } from './FilterPopover';
import { SearchPopover } from './SearchPopover';

export function ColumnHeader<T>({
  column,
  rows,
  serverMode,
  canHide,
  pin,
  stickyHeader,
}: {
  column: DataTableColumn<T>;
  rows: T[];
  serverMode: boolean;
  canHide: boolean;
  pin?: { side: 'left' | 'right'; offset: number };
  stickyHeader?: boolean;
}) {
  const { sorter, setSort } = useDataTableContext();
  const order =
    sorter?.sortField === column.dataIndex ? sorter.sortOrder : undefined;

  return (
    <Table.Th
      data-column={column.dataIndex}
      data-pinned={pin?.side}
      data-sticky-header={stickyHeader || undefined}
      className={classes.cell}
      style={
        pin
          ? ({ '--dt-pin-offset': `${pin.offset}px` } as CSSProperties)
          : undefined
      }
      w={column.width}
      ta={column.align}
      aria-sort={
        column.sortable
          ? order === 'asc'
            ? 'ascending'
            : order === 'desc'
              ? 'descending'
              : 'none'
          : undefined
      }
    >
      <Group gap={2} wrap='nowrap' w='100%'>
        <Box component='span' miw={0} flex={1}>
          {column.header}
        </Box>
        {column.sortable && column.showSortIcon !== false && (
          <ActionIcon
            variant='transparent'
            size='sm'
            color={
              order
                ? 'var(--mantine-primary-color-filled)'
                : 'var(--mantine-color-gray-6)'
            }
            aria-label={`Sort ${columnLabel(column)}: ${order ?? 'none'}`}
            onClick={() => setSort(column.dataIndex)}
          >
            <Icon
              name={
                order === 'asc'
                  ? 'sortAsc'
                  : order === 'desc'
                    ? 'sortDesc'
                    : 'sort'
              }
              size={16}
              strokeWidth={2}
            />
          </ActionIcon>
        )}
        {column.filterable && column.showFilterIcon !== false && (
          <FilterPopover column={column} rows={rows} serverMode={serverMode} />
        )}
        {column.searchable === true && column.showSearchIcon !== false && (
          <SearchPopover column={column} />
        )}
        {column.showMenu && (
          <ColumnMenu
            column={column}
            rows={rows}
            serverMode={serverMode}
            order={order}
            setSort={setSort}
            canHide={canHide}
          />
        )}
      </Group>
    </Table.Th>
  );
}
