import { Box, Button, Divider, Group, TextInput } from '@mantine/core';
import { useState } from 'react';
import { useDataTableConfig } from '../../context/DataTableConfigContext';
import { useDataTableContext } from '../../context/DataTableContext';
import { Icon } from '../../icons/Icon';
import type { DataTableColumn } from '../../types';
import { columnLabel } from '../../utils/columnLabel';

export function SearchControls<T>({
  column,
  onDone,
}: {
  column: DataTableColumn<T>;
  onDone: () => void;
}) {
  const { columnSearch, setColumnSearch } = useDataTableContext();
  const { labels } = useDataTableConfig();
  const name = `${labels.search} ${columnLabel(column)}`;
  const [draft, setDraft] = useState(
    columnSearch.find((item) => item.field === column.dataIndex)?.value ?? '',
  );

  function commit(value: string) {
    setColumnSearch(column.dataIndex, value);
    onDone();
  }

  return (
    <Box
      onKeyDown={(event) => {
        if (event.key === 'Enter') commit(draft);
      }}
    >
      <Box p={6}>
        <TextInput
          size='xs'
          autoFocus
          aria-label={name}
          placeholder={name}
          leftSection={<Icon name='search' size={14} />}
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
        />
      </Box>
      <Divider />
      <Group justify='space-between' p={6}>
        <Button size='xs' variant='subtle' onClick={() => commit('')}>
          {labels.reset}
        </Button>
        <Button size='xs' onClick={() => commit(draft)}>
          {labels.apply}
        </Button>
      </Group>
    </Box>
  );
}
