import { ActionIcon, Popover } from '@mantine/core';
import { useDataTableConfig } from '../../context/DataTableConfigContext';
import {
  useDataTableContext,
  useHeaderPopover,
} from '../../context/DataTableContext';
import { Icon } from '../../icons/Icon';
import type { DataTableColumn } from '../../types';
import { columnLabel } from '../../utils/columnLabel';
import { SearchControls } from './SearchControls';

export function SearchPopover<T>({ column }: { column: DataTableColumn<T> }) {
  const { columnSearch } = useDataTableContext();
  const { labels } = useDataTableConfig();
  const { opened, setOpened } = useHeaderPopover(`search:${column.dataIndex}`);
  const active = columnSearch.some((item) => item.field === column.dataIndex);

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
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
          color={
            active
              ? 'var(--mantine-primary-color-filled)'
              : 'var(--mantine-color-dimmed)'
          }
          aria-label={`${labels.search} ${columnLabel(column)}`}
          onClick={() => setOpened(!opened)}
        >
          <Icon name='search' size={16} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown p={0}>
        {opened && (
          <SearchControls column={column} onDone={() => setOpened(false)} />
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
