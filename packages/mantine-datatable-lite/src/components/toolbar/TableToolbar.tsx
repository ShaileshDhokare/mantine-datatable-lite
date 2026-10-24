import { ActionIcon, Group, Paper, Tooltip } from '@mantine/core';
import type { Ref } from 'react';
import { useDataTableConfig } from '../../context/DataTableConfigContext';
import { useDataTableContext } from '../../context/DataTableContext';
import { Icon } from '../../icons/Icon';
import classes from '../../styles/styles.module.css';
import type { DataTableColumn } from '../../types';
import { describeState } from '../../utils/describeState';
import { AppliedChips } from './AppliedChips';
import { ColumnPicker } from './ColumnPicker';
import { GlobalSearch } from './GlobalSearch';

export function TableToolbar<T>({
  ref,
  columns,
  globalSearch,
  columnSelector,
  showReset,
  showTableStatePills,
  debounceTime,
  maxChips,
  inactive,
}: {
  ref?: Ref<HTMLDivElement>;
  columns: DataTableColumn<T>[];
  globalSearch?: boolean;
  columnSelector?: boolean;
  showReset?: boolean;
  showTableStatePills?: boolean;
  debounceTime?: number;
  maxChips?: number;
  /** The bulk action bar covers the toolbar: keep it out of focus and the accessibility tree. */
  inactive?: boolean;
}) {
  const state = useDataTableContext();
  const { labels } = useDataTableConfig();
  const pills = showTableStatePills
    ? describeState(columns, state, labels)
    : [];
  return (
    <Paper
      ref={ref}
      radius='var(--mantine-radius-default)'
      withBorder
      inert={inactive}
      aria-hidden={inactive || undefined}
    >
      <Group
        className={classes.toolbarContent}
        justify='space-between'
        align='center'
        gap='lg'
        wrap='wrap'
      >
        <Group gap='xs' flex={1}>
          {showTableStatePills && (
            <AppliedChips
              pills={pills}
              maxChips={maxChips}
              inactive={inactive}
            />
          )}
        </Group>
        <Group gap='xs' wrap='nowrap'>
          {globalSearch && <GlobalSearch debounceTime={debounceTime} />}
          {columnSelector && (
            <ColumnPicker columns={columns} inactive={inactive} />
          )}
          {showReset && (
            <Tooltip label={labels.resetTable} withArrow>
              <ActionIcon
                variant='subtle'
                size='lg'
                aria-label={labels.resetTable}
                color='var(--mantine-color-dimmed)'
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
