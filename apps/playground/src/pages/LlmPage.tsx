import { Anchor, Button, Group } from '@mantine/core';
import { DocsLayout } from '../components/DocsLayout';
import { Markdown } from '../components/Markdown';
import guide from '../docs/generated/llm.md?raw';
import classes from '../App.module.css';

const [introduction, ...parts] = guide.replace(/^# .*\n+/, '').split(/^## /m);
const sections = parts.map((part) => {
  const lineEnd = part.indexOf('\n');
  const title = part.slice(0, lineEnd).trim();
  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title,
    markdown: `## ${part}`,
  };
});
const markdownUrl = `${import.meta.env.BASE_URL}llm.md`;
const tocLabels: Record<string, string> = {
  'package-and-compatibility': 'Compatibility',
  'installation-and-styles': 'Installation',
  'local-table-and-columns': 'Local table',
  'data-ownership-and-change-requests': 'Data ownership',
  'sorting-filters-and-search': 'Sort, filter and search',
  'caller-owned-pagination-and-remote-data': 'Remote data',
  'selection-expansion-and-actions': 'Selection and actions',
  'menus-pinning-and-persistence': 'Column layout',
  'appearance-and-row-events': 'Appearance',
  'rules-for-code-generation': 'Code generation',
};

export function LlmPage() {
  return <DocsLayout title='LLM' description='A complete Markdown guide for AI coding assistants and tools.'
    toc={sections.map(({ id, title }) => ({ id, label: tocLabels[id] ?? title }))}>
    <Group mb='xl'>
      <Button component='a' href={markdownUrl} download='mantine-datatable-lite-llm.md'>Download Markdown</Button>
      <Anchor href={markdownUrl} target='_blank' rel='noreferrer' size='sm'>Open Markdown ↗</Anchor>
    </Group>
    <Markdown>{introduction}</Markdown>
    {sections.map(({ id, markdown }) => <section key={id} id={id} className={classes.section}>
      <Markdown>{markdown}</Markdown>
    </section>)}
  </DocsLayout>;
}
