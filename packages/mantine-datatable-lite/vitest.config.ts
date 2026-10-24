import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    pool: 'threads',
    maxWorkers: 1,
    isolate: false,
    setupFiles: './vitest.setup.ts',
  },
});
