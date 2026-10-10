import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import process from 'node:process';

const pkg = JSON.parse(readFileSync(new URL('../packages/mantine-datatable-lite/package.json', import.meta.url), 'utf8'));
assert(!pkg.private, 'The library must be public.');
assert(!pkg.name.startsWith('@scope/'), 'Replace the placeholder npm scope.');
assert.match(pkg.version, /^\d+\.\d+\.\d+-alpha\.\d+$/, 'Only alpha versions can be published for now.');
assert.equal(pkg.publishConfig.tag, 'alpha', 'Publish alpha versions on the alpha dist-tag.');
assert.equal(pkg.publishConfig.access, 'public');
assert(pkg.license, 'Choose a license before publishing.');
assert(readFileSync(new URL('../packages/mantine-datatable-lite/LICENSE', import.meta.url), 'utf8').trim(), 'Include the license text.');
process.stdout.write(`Release metadata checked: ${pkg.name}@${pkg.version}\n`);
