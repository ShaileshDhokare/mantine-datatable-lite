import { isValidElement } from 'react';
import { Anchor, Blockquote, Code, List, Table, Text, Title } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import classes from '../App.module.css';

export function Markdown({ children }: { children: string }) {
  return <div className={classes.markdown}><ReactMarkdown remarkPlugins={[remarkGfm]} components={{
    h2: ({ children }) => <Title order={2} mt='xl' mb='md'>{children}</Title>,
    h3: ({ children }) => <Title order={3} mt='lg' mb='sm'>{children}</Title>,
    p: ({ children }) => <Text lh={1.8} mb='md'>{children}</Text>,
    a: ({ href, children }) => <Anchor href={href} target={href?.startsWith('https:') ? '_blank' : undefined} rel='noreferrer'>{children}</Anchor>,
    ul: ({ children }) => <List spacing='xs' mb='md'>{children}</List>,
    ol: ({ children }) => <List type='ordered' spacing='xs' mb='md'>{children}</List>,
    li: ({ children }) => <List.Item>{children}</List.Item>,
    blockquote: ({ children }) => <Blockquote color='blue' my='lg'>{children}</Blockquote>,
    code: ({ children }) => <Code>{children}</Code>,
    pre: ({ children }) => {
      if (!isValidElement<{ children?: string; className?: string }>(children)) return <pre>{children}</pre>;
      const language = /language-(\w+)/.exec(children.props.className ?? '')?.[1] ?? 'tsx';
      return <CodeBlock code={String(children.props.children ?? '').replace(/\n$/, '')} language={language} />;
    },
    table: ({ children }) => <Table.ScrollContainer minWidth={500}><Table withRowBorders>{children}</Table></Table.ScrollContainer>,
    thead: ({ children }) => <Table.Thead>{children}</Table.Thead>, tbody: ({ children }) => <Table.Tbody>{children}</Table.Tbody>,
    tr: ({ children }) => <Table.Tr>{children}</Table.Tr>, th: ({ children }) => <Table.Th>{children}</Table.Th>, td: ({ children }) => <Table.Td>{children}</Table.Td>,
  }}>{children}</ReactMarkdown></div>;
}
