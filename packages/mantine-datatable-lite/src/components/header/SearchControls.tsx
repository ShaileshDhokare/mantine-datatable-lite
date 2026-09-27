import { Box, Button, Divider, Group, TextInput } from '@mantine/core';
import { useState } from 'react';
import { useDataTableContext } from '../../context/DataTableContext';
import { Icon } from '../../icons/Icon';
import type { DataTableColumn } from '../../types';

export function SearchControls<T>({ column, onDone }: { column: DataTableColumn<T>; onDone: () => void }) {
  const { columnSearch, setColumnSearch } = useDataTableContext();
  const [draft, setDraft] = useState(columnSearch.find((item) => item.searchField === column.dataIndex)?.searchValue ?? '');

  function commit(value: string) {
    setColumnSearch(column.dataIndex, value);
    onDone();
  }

  return <Box onKeyDown={(event) => { if (event.key === 'Enter') commit(draft); }}>
    <Box p={6}>
      <TextInput size='xs' autoFocus aria-label={`Search ${String(column.header)}`}
        placeholder={`Search ${String(column.header)}`} leftSection={<Icon name='search' size={14} />}
        value={draft} onChange={(event) => setDraft(event.currentTarget.value)} />
    </Box>
    <Divider />
    <Group justify='space-between' p={6}>
      <Button size='xs' variant='subtle' onClick={() => commit('')}>Reset</Button>
      <Button size='xs' onClick={() => commit(draft)}>Apply</Button>
    </Group>
  </Box>;
}
