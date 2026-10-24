import { Badge, Code, Table, Text } from '@mantine/core';
import { api } from '../docs/generated/api.json';
import { propDescriptions } from '../docs/propDescriptions';
import classes from '../App.module.css';

export type ApiName = keyof typeof api;

/** Descriptions are plain text with `code` spans, as written in the package's JSDoc. */
function Description({ text }: { text: string }) {
  return text
    .split('`')
    .map((part, index) => (index % 2 ? <Code key={index}>{part}</Code> : part));
}

export function PropsTable({ name, only }: { name: ApiName; only?: string[] }) {
  const props = api[name].filter((prop) => !only || only.includes(prop.name));
  return <Table.ScrollContainer minWidth={600}><Table verticalSpacing='md' horizontalSpacing='sm' withRowBorders>
    <Table.Thead><Table.Tr><Table.Th w='20%'>Name</Table.Th><Table.Th w='35%'>Type</Table.Th><Table.Th>Description</Table.Th></Table.Tr></Table.Thead>
    <Table.Tbody>{props.map((prop) => <Table.Tr key={prop.name}>
      <Table.Td><Code>{prop.name}</Code>{prop.required && <Badge size='xs' color='gray' variant='light' mt={4}>Required</Badge>}</Table.Td>
      <Table.Td><Code className={classes.propType}>{prop.type}</Code></Table.Td>
      <Table.Td><Text size='sm' lh={1.65}><Description text={prop.description || propDescriptions[name]?.[prop.name] || 'See the public TypeScript contract.'} /></Text></Table.Td>
    </Table.Tr>)}</Table.Tbody>
  </Table></Table.ScrollContainer>;
}
