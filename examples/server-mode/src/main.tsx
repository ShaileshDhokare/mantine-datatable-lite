import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-datatable-lite/styles.css';
import { MantineProvider } from '@mantine/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider defaultColorScheme='auto'>
      <App />
    </MantineProvider>
  </StrictMode>,
);
