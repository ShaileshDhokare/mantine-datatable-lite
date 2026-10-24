import { Text } from '@mantine/core';
import { DocsLayout } from '../components/DocsLayout';
import { DocSection } from '../components/DocSection';
import { PropsTable, type ApiName } from '../components/PropsTable';
import { api, version } from '../docs/generated/api.json';

export function ApiPage() {
  const names = Object.keys(api) as ApiName[];
  return <DocsLayout title='API reference' description='The public props and request contracts of the package.'
    toc={names.map((name) => ({ id: name, label: name }))}>
    <Text c='dimmed' size='sm'>Names, types and required flags are generated from mantine-datatable-lite@{version} declarations at build time. Descriptions explain usage.</Text>
    {names.map((name) => <DocSection key={name} id={name} title={name}><PropsTable name={name} /></DocSection>)}
  </DocsLayout>;
}
