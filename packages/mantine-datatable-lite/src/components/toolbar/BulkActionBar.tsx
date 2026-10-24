import { ActionIcon, Group, Paper, Text, Tooltip } from '@mantine/core';
import type { CSSProperties, ReactNode, Ref } from 'react';
import { useDataTableConfig } from '../../context/DataTableConfigContext';
import { Icon } from '../../icons/Icon';
import classes from '../../styles/styles.module.css';

/** Replaces the standard toolbar while rows are selected, at the same size and padding. */
export function BulkActionBar({
  ref,
  count,
  showCount,
  actions,
  style,
  onClear,
}: {
  ref: Ref<HTMLDivElement>;
  count: number;
  showCount: boolean;
  actions: ReactNode;
  style: CSSProperties;
  onClear: () => void;
}) {
  const { labels } = useDataTableConfig();
  return (
    <Paper
      ref={ref}
      radius='sm'
      withBorder
      className={classes.bulkBar}
      style={style}
    >
      <Group
        className={classes.toolbarContent}
        justify='space-between'
        align='center'
        gap='lg'
        wrap='nowrap'
      >
        {showCount ? (
          <Text fw={600} size='sm'>
            {labels.selectedCount(count)}
          </Text>
        ) : (
          <span />
        )}
        <Group gap='xs' wrap='nowrap'>
          {actions}
          <Tooltip label={labels.clearSelection} withArrow>
            <ActionIcon
              variant='subtle'
              size='lg'
              color='var(--mantine-color-dimmed)'
              aria-label={labels.clearSelection}
              onClick={onClear}
            >
              <Icon name='clear' size={20} strokeWidth={1.5} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Paper>
  );
}
