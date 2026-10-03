import { ActionIcon, Group, Paper, Tooltip } from '@mantine/core';
import { useDataTableContext } from '../../context/DataTableContext';
import { Icon } from '../../icons/Icon';
import type { DataTableColumn } from '../../types';
import { describeState } from '../../utils/describeState';
import { AppliedChips } from './AppliedChips';
import { ColumnPicker } from './ColumnPicker';
import { GlobalSearch } from './GlobalSearch';

export function TableToolbar<T>({
  columns,
  globalSearch,
  columnSelector,
  showReset,
  showTableStatePills,
  debounceTime,
  maxChips,
  inactive,
}: {
  columns: DataTableColumn<T>[];
  globalSearch?: boolean;
  columnSelector?: boolean;
  showReset?: boolean;
  showTableStatePills?: boolean;
  debounceTime?: number;
  maxChips?: number;
  inactive?: boolean;
}) {
  const state = useDataTableContext();
  const pills = showTableStatePills ? describeState(columns, state) : [];
  return (
    <Paper shadow='xs' mb={'xs'}>
      <Group justify='space-between' align='center' gap='lg' p='4' wrap='wrap'>
        <Group gap='xs' flex={1}>
          {showTableStatePills && (
            <AppliedChips pills={pills} maxChips={maxChips} inactive={inactive} />
          )}
        </Group>
        <Group gap='xs' wrap='nowrap'>
          {globalSearch && <GlobalSearch debounceTime={debounceTime} />}
          {columnSelector && <ColumnPicker columns={columns} inactive={inactive} />}
          {showReset && (
            <Tooltip label='Reset table state' withArrow>
              <ActionIcon
                variant='subtle'
                size='lg'
                aria-label='Reset table state'
                color='var(--mantine-color-gray-6)'
                onClick={state.clearAll}
              >
                <Icon name='delete' size={20} strokeWidth={1.5} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>
    </Paper>
  );
}
