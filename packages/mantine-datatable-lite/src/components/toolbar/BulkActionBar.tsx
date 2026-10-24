import { ActionIcon, Group, Paper, Text, Tooltip } from '@mantine/core';
import type { CSSProperties, ReactNode, Ref } from 'react';
import { useDataTableConfig } from '../../context/DataTableConfigContext';
import { Icon } from '../../icons/Icon';

export function BulkActionBar({
  ref,
  count,
  showCount,
  actions,
  overlay,
  style,
  onClear,
}: {
  ref: Ref<HTMLDivElement>;
  count: number;
  showCount: boolean;
  actions: ReactNode;
  /** Covers the standard toolbar instead of taking its own row. */
  overlay: string | undefined;
  style: CSSProperties;
  onClear: () => void;
}) {
  const { labels } = useDataTableConfig();
  return (
    <Paper ref={ref} radius='sm' withBorder className={overlay} style={style}>
      <Group justify='space-between' align='center' gap='lg' p={4} wrap='nowrap'>
        {showCount ? (
          <Text fw={600} size='sm' ml='xs' aria-live='polite'>
            {labels.selectedCount(count)}
          </Text>
        ) : (
          <span />
        )}
        <Group gap='xs' wrap='nowrap'>
          {actions}
          <Tooltip label={labels.clearSelection}>
            <ActionIcon
              variant='transparent'
              size='lg'
              aria-label={labels.clearSelection}
              onClick={onClear}
            >
              <Icon name='clear' size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Paper>
  );
}
