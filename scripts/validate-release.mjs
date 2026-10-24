import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import process from 'node:process';
import { URL } from 'node:url';

const pkg = JSON.parse(readFileSync(new URL('../packages/mantine-datatable-lite/package.json', import.meta.url), 'utf8'));
assert(!pkg.private, 'The library must be public.');
assert(!pkg.name.startsWith('@scope/'), 'Replace the placeholder npm scope.');
// Prereleases publish on their own dist-tag so `npm install` keeps resolving the stable line.
const tags = { alpha: 'alpha', rc: 'next' };
const prerelease = pkg.version.match(/^\d+\.\d+\.\d+-(alpha|rc)\.\d+$/);
assert(prerelease, 'Only alpha (x.y.z-alpha.N) and rc (x.y.z-rc.N) versions can be published for now.');
assert.equal(pkg.publishConfig.tag, tags[prerelease[1]], `Publish ${prerelease[1]} versions on the ${tags[prerelease[1]]} dist-tag.`);
assert.equal(pkg.publishConfig.access, 'public');
assert(pkg.license, 'Choose a license before publishing.');
assert(readFileSync(new URL('../packages/mantine-datatable-lite/LICENSE', import.meta.url), 'utf8').trim(), 'Include the license text.');
process.stdout.write(`Release metadata checked: ${pkg.name}@${pkg.version}\n`);
