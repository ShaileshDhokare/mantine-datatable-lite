import { useState } from 'react';
import { Button, CopyButton, Group, Paper, Text, useComputedColorScheme } from '@mantine/core';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';
import classes from '../App.module.css';
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('jsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', tsx);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);

export function CodeBlock({ code, language = 'tsx', label, collapsible = false }: {
  code: string; language?: string; label?: string; collapsible?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const scheme = useComputedColorScheme('light');
  const lines = code.split('\n');
  const clipped = collapsible && !expanded && lines.length > 12;
  const displayedCode = clipped ? lines.slice(0, 12).join('\n') : code;
  return <Paper withBorder radius='md' className={classes.codeBlock}>
    <Group justify='space-between' px='md' py='xs' className={classes.codeHeader}>
      <Text size='xs' fw={600} c='dimmed'>{label ?? language.toUpperCase()}</Text>
      <CopyButton value={code} timeout={2500}>{({ copied, copy }) =>
        <Button size='compact-xs' variant='subtle' onClick={copy} aria-label={`Copy ${label ?? language} code`}>{copied ? 'Copied' : 'Copy'}</Button>}
      </CopyButton>
    </Group>
    <div className={classes.codeViewport} data-clipped={clipped || undefined}>
      <SyntaxHighlighter language={language} style={scheme === 'dark' ? oneDark : oneLight}
        customStyle={{ margin: 0, padding: 'var(--mantine-spacing-md)', background: 'transparent', fontSize: 13, lineHeight: 1.7 }}>{displayedCode}</SyntaxHighlighter>
    </div>
    {collapsible && lines.length > 12 && <Button fullWidth variant='subtle' radius={0}
      onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>{expanded ? 'Collapse code' : 'Expand code'}</Button>}
  </Paper>;
}
