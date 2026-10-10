import assert from 'node:assert/strict';
import { appendFileSync, readFileSync } from 'node:fs';
import process from 'node:process';

const pkg = JSON.parse(readFileSync(new URL('../packages/mantine-datatable-lite/package.json', import.meta.url), 'utf8'));
const response = await globalThis.fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg.name)}/${pkg.version}`);
assert(response.ok || response.status === 404, `Registry lookup failed: ${response.status}`);
const published = response.ok;
if (published) assert.equal((await response.json()).version, pkg.version);
assert(process.env.GITHUB_OUTPUT, 'This script runs as a GitHub Actions step.');
appendFileSync(process.env.GITHUB_OUTPUT, `published=${published}\n`);
process.stdout.write(published ? `${pkg.version} is already published; skip uploading it again.\n` : `${pkg.version} is ready for its first upload.\n`);
