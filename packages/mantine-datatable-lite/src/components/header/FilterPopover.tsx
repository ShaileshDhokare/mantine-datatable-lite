import { ActionIcon, Popover } from '@mantine/core';
import { useDataTableConfig } from '../../context/DataTableConfigContext';
import {
  useDataTableContext,
  useHeaderPopover,
} from '../../context/DataTableContext';
import { Icon } from '../../icons/Icon';
import type { DataTableColumn } from '../../types';
import { columnLabel } from '../../utils/columnLabel';
import { FilterControls } from './FilterControls';

export function FilterPopover<T>({
  column,
  rows,
  serverMode,
}: {
  column: DataTableColumn<T>;
  rows: T[];
  serverMode: boolean;
}) {
  const { filters } = useDataTableContext();
  const { labels } = useDataTableConfig();
  const { opened, setOpened } = useHeaderPopover(`filter:${column.dataIndex}`);
  const active = filters.some((filter) => filter.field === column.dataIndex);

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
          aria-label={`${labels.filter} ${columnLabel(column)}`}
          onClick={() => setOpened(!opened)}
        >
          <Icon
            name='filter'
            size={16}
            fill={active ? 'currentColor' : undefined}
            strokeWidth={2}
          />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown p={0}>
        {opened && (
          <FilterControls
            column={column}
            rows={rows}
            serverMode={serverMode}
            onDone={() => setOpened(false)}
          />
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
