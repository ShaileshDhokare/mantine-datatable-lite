import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: './tsconfig.build.json',
      outDirs: [
        { dir: 'dist', moduleFormat: 'esm' },
        { dir: 'dist', moduleFormat: 'cjs' },
      ],
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
      cssFileName: 'styles',
    },
    rolldownOptions: {
      external: [/^react(?:\/|$)/, /^react-dom(?:\/|$)/, /^@mantine\//],
      // The table uses hooks and context, so React Server Components must treat it as client code.
      output: { banner: "'use client';" },
    },
  },
});
