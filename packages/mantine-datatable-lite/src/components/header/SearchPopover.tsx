import { columnLabel } from '../../utils/columnLabel';
import { ActionIcon, Popover } from '@mantine/core';
import { useDataTableContext } from '../../context/DataTableContext';
import { Icon } from '../../icons/Icon';
import type { DataTableColumn } from '../../types';
import { SearchControls } from './SearchControls';

export function SearchPopover<T>({ column }: { column: DataTableColumn<T> }) {
  const { columnSearch, openSearch, setOpenSearch, setOpenFilter } = useDataTableContext();
  const opened = openSearch === column.dataIndex;
  const active = columnSearch.some((item) => item.searchField === column.dataIndex);

  return <Popover opened={opened} onChange={(next) => setOpenSearch(next ? column.dataIndex : null)}
    position='bottom-end' offset={0} width='auto' shadow='md' withinPortal trapFocus>
    <Popover.Target>
      <ActionIcon variant='transparent' size='sm'
        color={active ? 'var(--mantine-primary-color-filled)' : 'var(--mantine-color-gray-6)'}
        aria-label={`Search ${columnLabel(column)}`}
        onClick={() => { setOpenFilter(null); setOpenSearch(opened ? null : column.dataIndex); }}>
        <Icon name='search' size={16} />
      </ActionIcon>
    </Popover.Target>
    <Popover.Dropdown p={0}>
      {opened && <SearchControls column={column} onDone={() => setOpenSearch(null)} />}
    </Popover.Dropdown>
  </Popover>;
}
