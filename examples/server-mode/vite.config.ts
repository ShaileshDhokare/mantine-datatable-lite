import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // mantine-datatable-lite is linked from ../../packages. Resolve its React and
    // Mantine imports from this app, so there is one copy of each.
    dedupe: ['react', 'react-dom', '@mantine/core', '@mantine/hooks'],
  },
  server: {
    port: 5180,
    strictPort: true,
    proxy: { '/api': 'http://localhost:4000' },
  },
});
