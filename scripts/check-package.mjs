import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import process from 'node:process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const library = join(root, 'packages/mantine-datatable-lite');
const pkg = JSON.parse(readFileSync(join(library, 'package.json'), 'utf8'));
const published = process.argv.includes('--published');
const npmCli = process.env.npm_execpath;
assert(npmCli, 'Run this check with npm run check:package.');
const fixture = mkdtempSync(join(root, '.package-check-'));

function run(args, cwd = fixture) {
  const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, `${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

try {
  const [packed] = JSON.parse(run([npmCli, 'pack', ...(published ? [`${pkg.name}@${pkg.version}`, '--registry=https://registry.npmjs.org/'] : []), '--ignore-scripts', '--json', '--pack-destination', fixture], library));
  const files = packed.files.map(({ path }) => path);
  for (const file of ['package.json', 'README.md', 'LICENSE', 'dist/index.js', 'dist/index.cjs', 'dist/index.d.mts', 'dist/index.d.cts', 'dist/styles.css']) {
    assert(files.includes(file), `Missing packed file: ${file}`);
  }
  assert(files.includes('THIRD_PARTY_NOTICES'), 'Ship the inline SVG attribution notices.');
  assert(files.every((file) => file.startsWith('dist/') || ['package.json', 'README.md', 'LICENSE', 'THIRD_PARTY_NOTICES'].includes(file)), 'Only built assets, metadata, README, and license notices should ship.');
  assert(!files.some((file) => /test|node_modules/.test(file)), 'Tests and dependencies must not ship.');
  assert.equal(Object.keys(pkg.dependencies ?? {}).length, 0, 'Keep runtime dependencies as peers.');
  writeFileSync(join(fixture, 'package.json'), JSON.stringify({ name: 'release-consumer', private: true, type: 'module' }));
  // Install the real tarball; reuse the workspace's peer versions through ancestor resolution.
  run([npmCli, 'install', '--prefix', fixture, join(fixture, packed.filename), '--offline', '--ignore-scripts', '--legacy-peer-deps', '--package-lock=false', '--no-audit', '--no-fund', '--workspaces=false']);
  assert.equal(realpathSync(join(fixture, 'node_modules', pkg.name)), join(fixture, 'node_modules', pkg.name), 'Consumer must install the tarball instead of resolving the workspace link.');
  const installed = join(fixture, 'node_modules', pkg.name);
  const installedPackage = JSON.parse(readFileSync(join(installed, 'package.json'), 'utf8'));
  assert.equal(installedPackage.name, pkg.name);
  assert.equal(installedPackage.version, pkg.version);
  assert.equal(Object.keys(installedPackage.dependencies ?? {}).length, 0, 'The installed artifact must keep runtime dependencies as peers.');
  const gzipBytes = gzipSync(readFileSync(join(installed, 'dist/index.js'))).length + gzipSync(readFileSync(join(installed, 'dist/styles.css'))).length;
  assert(gzipBytes <= 25 * 1024, `Library JS + CSS exceeds the 25 KiB gzip budget: ${gzipBytes}`);
  for (const file of ['dist/index.js', 'dist/index.cjs']) {
    const code = readFileSync(join(installed, file), 'utf8');
    assert(/^['"]use client['"];/.test(code), `${file} must start with 'use client' for React Server Components.`);
    assert(code.includes('process.env.NODE_ENV'), `${file} must leave dev warnings to the consumer's bundler.`);
    assert(!code.includes('@mantine/dates'), `${file} must not import @mantine/dates; apps pass a date input instead.`);
  }

  const api = `
import { DataTable, Icon, rowActionsColumn } from '${pkg.name}';
import type { DataTableColumn, DataTableProps, DataTableLabels, DateInputProps, ColumnType, IconName, IconProps, MenuOption, Sorter, SortOrder, Filter, FilterValue, FilterOption, NumericOperator, FilterRenderContext, ColumnSearch, Pagination, PaginationChange, TableChange, RowId, IdAccessor, NumericFilterValue, StringFilterValue, BooleanFilterValue, DateFilterValue, SelectionSnapshot, SelectionConfig, ExpandableConfig } from '${pkg.name}';
type Row = { id: number; name: string };
export type PublicTypes = [DataTableColumn<Row>, DataTableProps<Row>, DataTableLabels, DateInputProps, ColumnType, IconName, IconProps, MenuOption, Sorter, SortOrder, Filter, FilterValue, FilterOption, NumericOperator, FilterRenderContext, ColumnSearch, Pagination, PaginationChange, TableChange, RowId, IdAccessor<Row>, NumericFilterValue, StringFilterValue, BooleanFilterValue, DateFilterValue, SelectionSnapshot<Row>, SelectionConfig<Row>, ExpandableConfig<Row>];
export const actions = rowActionsColumn<Row>({ render: (row) => row.name });
export const table = DataTable<Row>;
export const icon = Icon;
`;
  writeFileSync(join(fixture, 'consumer.mts'), api);
  writeFileSync(join(fixture, 'consumer.cts'), api);
  writeFileSync(join(fixture, 'styles.d.ts'), "declare module '*.css';\n");
  const tsc = join(root, 'node_modules/typescript/bin/tsc');
  run([tsc, '--noEmit', '--strict', '--skipLibCheck', 'false', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2020', '--lib', 'ESNext,DOM', 'styles.d.ts', 'consumer.mts', 'consumer.cts']);

  const jsx = `${api}
import '${pkg.name}/styles.css';
export const example = <DataTable rows={[{ id: 1, name: 'Alpha' }]} columns={[{ dataIndex: 'name', header: 'Name', render: (row) => { const inferred: Row = row; return inferred.name; } }]} />;
`;
  writeFileSync(join(fixture, 'consumer.tsx'), jsx);
  run([tsc, '--noEmit', '--strict', '--skipLibCheck', 'false', '--module', 'ESNext', '--moduleResolution', 'Bundler', '--jsx', 'react-jsx', '--target', 'ES2020', '--lib', 'ESNext,DOM', 'styles.d.ts', 'consumer.tsx']);

  const runtime = `
const { createElement } = react;
const { renderToString } = reactDom;
const { MantineProvider } = mantine;
const exportedNames = Object.keys(api).sort().join(',');
if (exportedNames !== 'DataTable,Icon,rowActionsColumn') throw new Error('Unexpected runtime exports: ' + exportedNames);
const html = renderToString(createElement(MantineProvider, null, createElement(api.DataTable, { rows: [{ id: 1, name: 'Packed consumer' }], columns: [{ dataIndex: 'name', header: 'Name' }] })));
if (!html.includes('Packed consumer')) throw new Error('Packed table did not render.');
`;
  writeFileSync(join(fixture, 'runtime.mjs'), `import * as api from '${pkg.name}'; import * as react from 'react'; import * as reactDom from 'react-dom/server'; import * as mantine from '@mantine/core';\n${runtime}`);
  writeFileSync(join(fixture, 'runtime.cjs'), `const api = require('${pkg.name}'); const react = require('react'); const reactDom = require('react-dom/server'); const mantine = require('@mantine/core');\n${runtime}`);
  run(['runtime.mjs']);
  run(['runtime.cjs']);

  writeFileSync(join(fixture, 'build.mjs'), `import { build } from 'vite'; await build({ configFile: false, root: ${JSON.stringify(fixture)}, logLevel: 'error', build: { lib: { entry: 'consumer.tsx', formats: ['es'], fileName: 'consumer', cssFileName: 'consumer' }, rolldownOptions: { external: [/^react(?:\\/|$)/, /^react-dom(?:\\/|$)/, /^@mantine\\//] } } });`);
  run(['build.mjs']);
  assert(existsSync(join(fixture, 'dist/consumer.css')), 'The consumer bundler must resolve the public CSS export.');
  process.stdout.write(`${published ? 'Published npm artifact' : 'Packed'} ${pkg.name}@${pkg.version}: ${files.length} files, ${(packed.size / 1024).toFixed(1)} KiB tarball, ${(gzipBytes / 1024).toFixed(1)} KiB gzip JS + CSS.\nESM/CJS rendering, NodeNext/Bundler types, all public exports, and a Vite consumer build passed.\n`);
} finally {
  assert(dirname(fixture) === root && fixture.startsWith(join(root, '.package-check-')));
  rmSync(fixture, { recursive: true, force: true });
}
