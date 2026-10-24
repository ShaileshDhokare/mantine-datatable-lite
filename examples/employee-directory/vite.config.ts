import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The web app runs on WEB_PORT and proxies /api to the Express API on API_PORT.
const webPort = Number(process.env.WEB_PORT ?? 5180);
const apiPort = Number(process.env.API_PORT ?? 4000);

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Needed when mantine-datatable-lite is linked from ../../packages (see the
    // README): its React and Mantine imports then resolve from this app, so there
    // is one copy of each. Harmless with the npm package.
    dedupe: ['react', 'react-dom', '@mantine/core', '@mantine/hooks'],
  },
  server: {
    port: webPort,
    strictPort: true,
    proxy: { '/api': `http://localhost:${apiPort}` },
  },
});
