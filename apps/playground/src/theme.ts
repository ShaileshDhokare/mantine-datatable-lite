import { createTheme } from '@mantine/core';

export const theme = createTheme({
  defaultRadius: 'sm',
  components: {
    Button: {
      defaultProps: {
        radius: 'sm',
        size: 'xs',
      },
    },
  },
});
