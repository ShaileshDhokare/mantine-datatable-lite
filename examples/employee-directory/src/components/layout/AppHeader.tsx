import { Box, Group, Text, Title } from '@mantine/core';
import { APP_TITLE } from '../../constants/app';
import { ResetDemoButton } from './ResetDemoButton';
import { ThemeToggle } from './ThemeToggle';

export function AppHeader({ onDataReset }: { onDataReset: () => void }) {
  return (
    <Group justify='space-between' align='flex-start' gap='sm'>
      <Box flex='1 1 320px'>
        <Title order={1} size='h2'>
          {APP_TITLE}
        </Title>
        <Text c='dimmed' size='sm'>
          mantine-datatable-lite with one Express + SQLite API, used two ways: the
          server sorts, filters and pages the data, or the browser does.
        </Text>
      </Box>
      <Group gap='xs' wrap='nowrap'>
        <ResetDemoButton onReset={onDataReset} />
        <ThemeToggle />
      </Group>
    </Group>
  );
}
