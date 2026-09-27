import type { ReactNode } from 'react';
import { Badge, Group, NavLink, Paper, Stack, Text, Title } from '@mantine/core';
import { NavLink as RouterLink } from 'react-router';
import classes from '../App.module.css';

export type Scenario<Id extends string> = {
  id: Id;
  label: string;
  description: string;
};

type PlaygroundLayoutProps<Id extends string> = {
  section: 'basic' | 'sorting' | 'filtering' | 'searching' | 'pagination' | 'advanced';
  scenarios: readonly Scenario<Id>[];
  active: Id;
  onSelect: (id: Id) => void;
  controls: ReactNode;
  children: ReactNode;
};

const features = [
  { id: 'basic', label: 'Basic table' },
  { id: 'sorting', label: 'Sorting' },
  { id: 'filtering', label: 'Filtering' },
  { id: 'searching', label: 'Searching' },
  { id: 'pagination', label: 'Pagination' },
  { id: 'advanced', label: 'Advanced example' },
] as const;

export function PlaygroundLayout<Id extends string>({
  section, scenarios, active, onSelect, controls, children,
}: PlaygroundLayoutProps<Id>) {
  const current = scenarios.find((scenario) => scenario.id === active)!;

  return (
    <div className={classes.shell}>
      <aside className={classes.majorSidebar} aria-label='Feature navigation'>
        <Text fw={700} mb='md'>Features</Text>
        <Stack gap={2}>
          {features.map((feature) => (
            <NavLink key={feature.id} component={RouterLink} to={`/${feature.id}`}
              label={feature.label} active={section === feature.id} variant='light' />
          ))}
        </Stack>
      </aside>

      <main className={classes.content}>
        <Text size='sm' fw={700} c='blue'>DATATABLE PLAYGROUND</Text>
        <Title order={1} mt='xs'>{current.label}</Title>
        <Text c='dimmed' mt='xs' mb='xl'>{current.description}</Text>
        <Paper withBorder radius='md' className={classes.preview}>
          <div className={classes.tablePane}>{children}</div>
        </Paper>
        <Group mt='md' gap='xs'>
          <Badge variant='light' color='gray'>Mantine theme</Badge>
          <Text size='sm' c='dimmed'>Change the controls to explore this example.</Text>
        </Group>
      </main>

      <aside className={classes.sidebar} aria-label='Example navigation'>
        <Text fw={700} mb='md'>Scenarios</Text>
        <Stack gap={2} className={classes.menu}>
          {scenarios.map((scenario) => (
            <NavLink key={scenario.id} label={scenario.label} active={active === scenario.id}
              onClick={() => onSelect(scenario.id)} variant='light' />
          ))}
        </Stack>
        <Text fw={600} my='lg'>Props</Text>
        {controls}
      </aside>
    </div>
  );
}
