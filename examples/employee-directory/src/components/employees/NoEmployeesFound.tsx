import { Stack, Text } from '@mantine/core';
import { Icon } from 'mantine-datatable-lite';

/**
 * The tables' empty state. Until the first rows arrive it keeps its space but
 * stays invisible, so the loading overlay does not sit on "No employees match".
 */
export function NoEmployeesFound({ loaded }: { loaded: boolean }) {
  return (
    <Stack align='center' gap={4} py='md' style={{ visibility: loaded ? 'visible' : 'hidden' }}>
      <Icon name='search' size={28} strokeWidth={1.5} color='var(--mantine-color-dimmed)' />
      <Text fw={500}>No employees match these filters</Text>
      <Text size='sm' c='dimmed'>
        Remove a filter or clear the search to see more people.
      </Text>
    </Stack>
  );
}
