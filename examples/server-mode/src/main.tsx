import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-datatable-lite/styles.css';
import { createTheme, MantineProvider, type CSSVariablesResolver } from '@mantine/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Mantine's default secondary text and light-mode link colors are below the
// WCAG AA 4.5:1 contrast ratio for small text. These keep the look and pass it.
const theme = createTheme({ primaryShade: { light: 8, dark: 8 } });

const resolver: CSSVariablesResolver = () => ({
  variables: {},
  light: { '--mantine-color-dimmed': 'var(--mantine-color-gray-7)' },
  dark: { '--mantine-color-dimmed': 'var(--mantine-color-dark-1)' },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} cssVariablesResolver={resolver} defaultColorScheme='auto'>
      <App />
    </MantineProvider>
  </StrictMode>,
);
