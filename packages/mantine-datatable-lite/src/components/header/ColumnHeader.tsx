import { ActionIcon, Box, Group, Table } from '@mantine/core';
import { useDataTableContext } from '../../context/DataTableContext';
import { Icon } from '../../icons/Icon';
import type { DataTableColumn } from '../../types';
import { ColumnMenu } from './ColumnMenu';
import { FilterPopover } from './FilterPopover';
import { SearchPopover } from './SearchPopover';

export function ColumnHeader<T>({ column, rows, serverMode }: { column: DataTableColumn<T>; rows: T[]; serverMode: boolean }) {
  const { sorter, setSort } = useDataTableContext();
  const order = sorter?.sortField === column.dataIndex ? sorter.sortOrder : undefined;

  return (
    <Table.Th
      w={column.width}
      ta={column.align}
      aria-sort={column.sortable ? order === 'asc' ? 'ascending' : order === 'desc' ? 'descending' : 'none' : undefined}
    >
      <Group gap={4} wrap='nowrap' w='100%'>
        <Box component='span' miw={0} flex={1}>{column.header}</Box>
        {column.sortable && column.showSortIcon !== false && (
          <ActionIcon
            variant='transparent'
            size='sm'
            color={order ? 'var(--mantine-primary-color-filled)' : 'var(--mantine-color-gray-6)'}
            aria-label={`Sort ${String(column.header)}: ${order ?? 'none'}`}
            onClick={() => setSort(column.dataIndex)}
          >
            <Icon name={order === 'asc' ? 'sortAsc' : order === 'desc' ? 'sortDesc' : 'sort'} size={16} strokeWidth={2} />
          </ActionIcon>
        )}
        {column.filterable && column.showFilterIcon !== false && <FilterPopover column={column} rows={rows} serverMode={serverMode} />}
        {column.searchable === true && column.showSearchIcon !== false && <SearchPopover column={column} />}
        {column.showMenu && <ColumnMenu column={column} rows={rows} serverMode={serverMode} order={order} setSort={setSort} />}
      </Group>
    </Table.Th>
  );
}
