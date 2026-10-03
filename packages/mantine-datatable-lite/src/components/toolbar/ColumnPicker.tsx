import { ActionIcon, Box, Button, Checkbox, Divider, Group, Popover, ScrollArea, Stack, Tooltip } from '@mantine/core';
import { useState } from 'react';
import { useDataTableContext } from '../../context/DataTableContext';
import { Icon } from '../../icons/Icon';
import type { DataTableColumn } from '../../types';

export function ColumnPicker<T>({ columns }: { columns: DataTableColumn<T>[] }) {
  const { hiddenColumns, setHiddenColumns } = useDataTableContext();
  const [opened, setOpened] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  return <Popover position='bottom-end' withinPortal opened={opened} onChange={setOpened}>
    <Popover.Target>
      <Tooltip label='Select columns' withArrow>
        <ActionIcon variant='subtle' size='lg' aria-label='Select columns'
          color={hiddenColumns.length ? 'var(--mantine-primary-color-filled)' : 'var(--mantine-color-gray-6)'}
          onClick={() => {
            setSelected(columns.filter((column) => !hiddenColumns.includes(column.dataIndex)).map((column) => column.dataIndex));
            setOpened((current) => !current);
          }}>
          <Icon name='show' size={20} strokeWidth={1.5} />
        </ActionIcon>
      </Tooltip>
    </Popover.Target>
    <Popover.Dropdown p={0}>
      <Box p={6}>
        <ScrollArea.Autosize mah={220}>
          <Checkbox.Group value={selected} onChange={setSelected}>
            <Stack gap={2}>
              {columns.map((column) => <Checkbox key={column.dataIndex} value={column.dataIndex}
                label={column.header} size='xs' px={6} py={3}
                disabled={column.hideable === false || (selected.length === 1 && selected.includes(column.dataIndex))} />)}
            </Stack>
          </Checkbox.Group>
        </ScrollArea.Autosize>
      </Box>
      <Divider />
      <Group justify='space-between' p={6}>
        <Button size='xs' variant='subtle' onClick={() => {
          setHiddenColumns([]);
          setOpened(false);
        }}>Reset</Button>
        <Button size='xs' disabled={!selected.length} onClick={() => {
          setHiddenColumns(columns.filter((column) => !selected.includes(column.dataIndex)).map((column) => column.dataIndex));
          setOpened(false);
        }}>Apply</Button>
      </Group>
    </Popover.Dropdown>
  </Popover>;
}
