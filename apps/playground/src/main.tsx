import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { HashRouter } from 'react-router';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-datatable-lite/styles.css';
import { App } from './App';
import { theme } from './theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <HashRouter><App /></HashRouter>
    </MantineProvider>
  </StrictMode>,
);
