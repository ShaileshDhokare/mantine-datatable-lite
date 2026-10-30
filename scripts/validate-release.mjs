import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import process from 'node:process';
import { URL } from 'node:url';

const pkg = JSON.parse(readFileSync(new URL('../packages/mantine-datatable-lite/package.json', import.meta.url), 'utf8'));
assert(!pkg.private, 'The library must be public.');
assert(!pkg.name.startsWith('@scope/'), 'Replace the placeholder npm scope.');
// Stable versions publish on `latest`. Prereleases publish on their own dist-tag,
// so `npm install mantine-datatable-lite` keeps resolving the stable line.
const tags = { stable: 'latest', alpha: 'alpha', rc: 'next' };
const release = pkg.version.match(/^\d+\.\d+\.\d+(?:-(alpha|rc)\.\d+)?$/);
assert(release, 'Publish stable (x.y.z), alpha (x.y.z-alpha.N) or rc (x.y.z-rc.N) versions only.');
const kind = release[1] ?? 'stable';
assert.equal(pkg.publishConfig.tag, tags[kind], `Publish ${kind} versions on the ${tags[kind]} dist-tag.`);
assert.equal(pkg.publishConfig.access, 'public');
assert(pkg.license, 'Choose a license before publishing.');
assert(readFileSync(new URL('../packages/mantine-datatable-lite/LICENSE', import.meta.url), 'utf8').trim(), 'Include the license text.');
process.stdout.write(`Release metadata checked: ${pkg.name}@${pkg.version} (${pkg.publishConfig.tag})\n`);
