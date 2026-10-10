import { useEffect, useState } from 'react';
import { Alert, Loader, Tabs } from '@mantine/core';
import { CodeBlock } from './CodeBlock';

const sources = import.meta.glob<string>(['../pages/*.tsx', '../data.ts', '../useServerData.ts', '../serverEmployees.ts', '../queryEmployees.ts'], { query: '?raw', import: 'default' });
export function SourceCode({ files }: { files: string[] }) {
  const [file, setFile] = useState(files[0]);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    let current = true;
    setCode(''); setError(false);
    const loader = sources[file.includes('Page') ? `../pages/${file}` : `../${file}`];
    if (!loader) { setError(true); return; }
    loader().then((source) => { if (current) setCode(source); }).catch(() => { if (current) setError(true); });
    return () => { current = false; };
  }, [file]);
  return <Tabs value={file} onChange={(value) => value && setFile(value)} keepMounted={false}>
    <Tabs.List mb='md'>{files.map((name) => <Tabs.Tab key={name} value={name}>{name}</Tabs.Tab>)}</Tabs.List>
    <Tabs.Panel value={file}>{error ? <Alert color='red'>Could not load source. Refresh this page to try again.</Alert>
      : code ? <CodeBlock key={file} code={code} label={file} collapsible /> : <Loader size='sm' />}</Tabs.Panel>
  </Tabs>;
}
