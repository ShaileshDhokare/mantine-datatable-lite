import { createTheme, type CSSVariablesResolver } from '@mantine/core';

// Mantine's default secondary text and light-mode link colors are below the
// WCAG AA 4.5:1 contrast ratio for small text. These keep the look and pass it.
export const theme = createTheme({ primaryShade: { light: 8, dark: 8 } });

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: { '--mantine-color-dimmed': 'var(--mantine-color-gray-7)' },
  dark: { '--mantine-color-dimmed': 'var(--mantine-color-dark-1)' },
});
