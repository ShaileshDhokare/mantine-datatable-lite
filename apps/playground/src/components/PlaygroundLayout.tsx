import { useState, type ReactNode } from 'react';
import { Anchor, Group, Paper, Select, Tabs, Text, Title } from '@mantine/core';
import { DocsLayout } from './DocsLayout';
import { Markdown } from './Markdown';
import { PropsTable } from './PropsTable';
import { SourceCode } from './SourceCode';
import { features, type Feature } from '../docs/features';
import { repository } from '../docs/navigation';
import classes from '../App.module.css';

export type Scenario<Id extends string> = {
  id: Id;
  label: string;
  description: string;
};

type PlaygroundLayoutProps<Id extends string> = {
  section: Feature;
  scenarios: readonly Scenario<Id>[];
  active: Id;
  onSelect: (id: Id) => void;
  controls: ReactNode;
  children: ReactNode;
};

export function PlaygroundLayout<Id extends string>({
  section, scenarios, active, onSelect, controls, children,
}: PlaygroundLayoutProps<Id>) {
  const current = scenarios.find((scenario) => scenario.id === active)!;
  const doc = features[section];
  const [tab, setTab] = useState<string | null>('documentation');
  const toc = tab === 'props' ? [{ id: 'table-props', label: 'Table props' }, { id: 'column-props', label: 'Column props' }]
    : [{ id: 'usage', label: 'Usage' }, { id: 'demo', label: current.label }, { id: 'source', label: 'Example source' }];

  return (
    <DocsLayout title={doc.title} description={doc.description} toc={toc} scenarios={scenarios} active={active}>
      <Group gap='lg' mb='xl'>
        <Anchor href={`${repository}/tree/master/apps/playground/src/pages/${doc.files[0]}`} size='sm' target='_blank' rel='noreferrer'>View source ↗</Anchor>
        <Anchor href={`${repository}/issues`} size='sm' target='_blank' rel='noreferrer'>Report an issue ↗</Anchor>
      </Group>
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List><Tabs.Tab value='documentation'>Documentation</Tabs.Tab><Tabs.Tab value='props'>Props</Tabs.Tab></Tabs.List>
        <Tabs.Panel value='documentation'>
          <section id='usage' className={classes.section}><Title order={2} mb='md'>Usage</Title><Markdown>{doc.markdown}</Markdown></section>
          <section id='demo' className={classes.section}>
            <Group justify='space-between' mb='md'><Title order={2}>{current.label}</Title>
              {scenarios.length > 1 && <Select aria-label='Example scenario' w={230} data={scenarios.map(({ id, label }) => ({ value: id, label }))}
                value={active} onChange={(id) => id && onSelect(id as Id)} allowDeselect={false} />}
            </Group>
            <Text c='dimmed' mb='lg'>{current.description}</Text>
            <Paper withBorder radius='md' className={classes.preview}><div className={classes.demoGrid}>
              <div className={classes.tablePane}>{children}</div>
              <aside className={classes.controls} aria-label='Demo controls'><Text fw={600} size='sm' mb='md'>Demo controls</Text>{controls}</aside>
            </div></Paper>
          </section>
          <section id='source' className={classes.section}><Title order={2} mb='md'>Example source</Title>
            <Text size='sm' c='dimmed' mb='lg'>The complete playground implementation, including its controls and supporting data.</Text>
            <SourceCode files={doc.files} />
          </section>
        </Tabs.Panel>
        <Tabs.Panel value='props'>
          <section id='table-props' className={classes.section}><Title order={2} mb='md'>Table props</Title><PropsTable name='DataTableProps' only={doc.props} /></section>
          <section id='column-props' className={classes.section}><Title order={2} mb='md'>Column props</Title><PropsTable name='DataTableColumn' /></section>
        </Tabs.Panel>
      </Tabs>
    </DocsLayout>
  );
}
