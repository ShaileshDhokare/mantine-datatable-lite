import { Container, Stack, Tabs } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { useState } from 'react';
import { AppHeader } from './components/layout/AppHeader';
import { SimulationControls } from './components/layout/SimulationControls';
import { DEFAULT_TAB, isExampleTab, STORAGE_KEYS, type ExampleTab } from './constants/app';
import { ClientSideTable } from './features/client-side/ClientSideTable';
import { ServerSideTable } from './features/server-side/ServerSideTable';

export function App() {
  const [storedTab, setTab] = useLocalStorage<ExampleTab>({
    key: STORAGE_KEYS.activeTab,
    defaultValue: DEFAULT_TAB,
    getInitialValueInEffect: false,
  });
  const tab = isExampleTab(storedTab) ? storedTab : DEFAULT_TAB;

  // Bumped by Reset demo data. Remounting the tables clears their sort, filters,
  // page and selection, and loads the restored rows.
  const [dataVersion, setDataVersion] = useState(0);

  return (
    <Container component='main' size='xl' py='lg'>
      <Stack gap='md'>
        <AppHeader onDataReset={() => setDataVersion((version) => version + 1)} />
        <SimulationControls />

        {/* Inactive tabs stay mounted (hidden with React's Activity), so each
            table keeps its state, and reloads its data when shown again. */}
        <Tabs value={tab} onChange={(value) => isExampleTab(value) && setTab(value)}>
          <Tabs.List>
            <Tabs.Tab value='server-side'>Server-side</Tabs.Tab>
            <Tabs.Tab value='client-side'>Client-side</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='server-side' pt='md'>
            <ServerSideTable key={dataVersion} />
          </Tabs.Panel>
          <Tabs.Panel value='client-side' pt='md'>
            <ClientSideTable key={dataVersion} />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
