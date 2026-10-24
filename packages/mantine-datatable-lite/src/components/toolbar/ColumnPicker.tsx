import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Divider,
  Group,
  Popover,
  ScrollArea,
  Stack,
  Tooltip,
} from '@mantine/core';
import { useState } from 'react';
import { useDataTableConfig } from '../../context/DataTableConfigContext';
import { useDataTableContext } from '../../context/DataTableContext';
import { Icon } from '../../icons/Icon';
import type { DataTableColumn } from '../../types';

export function ColumnPicker<T>({
  columns,
  inactive,
}: {
  columns: DataTableColumn<T>[];
  inactive?: boolean;
}) {
  const { hiddenColumns, setHiddenColumns } = useDataTableContext();
  const { labels } = useDataTableConfig();
  const [opened, setOpened] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Popover
      position='bottom-end'
      withinPortal
      opened={opened}
      onChange={setOpened}
      disabled={inactive}
    >
      <Popover.Target>
        <Tooltip label={labels.selectColumns} withArrow disabled={inactive}>
          <ActionIcon
            variant='subtle'
            size='lg'
            aria-label={labels.selectColumns}
            color={
              hiddenColumns.length
                ? 'var(--mantine-primary-color-filled)'
                : 'var(--mantine-color-dimmed)'
            }
            onClick={() => {
              setSelected(
                columns
                  .filter((column) => !hiddenColumns.includes(column.dataIndex))
                  .map((column) => column.dataIndex),
              );
              setOpened((current) => !current);
            }}
          >
            <Icon name='show' size={20} strokeWidth={1.5} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown p={0}>
        <Box p={6}>
          <ScrollArea.Autosize mah={220}>
            <Checkbox.Group value={selected} onChange={setSelected}>
              <Stack gap={2}>
                {columns.map((column) => (
                  <Checkbox
                    key={column.dataIndex}
                    value={column.dataIndex}
                    label={column.header}
                    size='xs'
                    px={6}
                    py={3}
                    disabled={
                      column.hideable === false ||
                      (selected.length === 1 &&
                        selected.includes(column.dataIndex))
                    }
                  />
                ))}
              </Stack>
            </Checkbox.Group>
          </ScrollArea.Autosize>
        </Box>
        <Divider />
        <Group justify='space-between' p={6}>
          <Button
            size='xs'
            variant='subtle'
            onClick={() => {
              setHiddenColumns([]);
              setOpened(false);
            }}
          >
            {labels.reset}
          </Button>
          <Button
            size='xs'
            disabled={!selected.length}
            onClick={() => {
              setHiddenColumns(
                columns
                  .filter((column) => !selected.includes(column.dataIndex))
                  .map((column) => column.dataIndex),
              );
              setOpened(false);
            }}
          >
            {labels.apply}
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
}
