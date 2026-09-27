import { ActionIcon, Popover } from '@mantine/core';
import { useDataTableContext } from '../../context/DataTableContext';
import { Icon } from '../../icons/Icon';
import type { DataTableColumn } from '../../types';
import { FilterControls } from './FilterControls';

export function FilterPopover<T>({ column, rows, serverMode }: {
  column: DataTableColumn<T>;
  rows: T[];
  serverMode: boolean;
}) {
  const { filters, openFilter, setOpenFilter, setOpenSearch } = useDataTableContext();
  const opened = openFilter === column.dataIndex;
  const active = filters.some((filter) => filter.field === column.dataIndex);

  return (
    <Popover
      opened={opened}
      onChange={(next) => setOpenFilter(next ? column.dataIndex : null)}
      position='bottom-end'
      offset={0}
      width='auto'
      shadow='md'
      withinPortal
      trapFocus
    >
      <Popover.Target>
        <ActionIcon
          variant='transparent'
          size='sm'
          color={active ? 'var(--mantine-primary-color-filled)' : 'var(--mantine-color-gray-6)'}
          aria-label={`Filter ${String(column.header)}`}
          onClick={() => { setOpenSearch(null); setOpenFilter(opened ? null : column.dataIndex); }}
        >
          <Icon name='filter' size={16} fill={active ? 'currentColor' : undefined} strokeWidth={2} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown p={0}>
        {opened && <FilterControls column={column} rows={rows} serverMode={serverMode}
          onDone={() => setOpenFilter(null)} />}
      </Popover.Dropdown>
    </Popover>
  );
}
