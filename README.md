# mantine-datatable-lite

A typed DataTable for **Mantine 9.6+ and React 19.2+**, [published on
npm](https://www.npmjs.com/package/mantine-datatable-lite) under the MIT license.

```sh
npm install mantine-datatable-lite
```

See the [package README](packages/mantine-datatable-lite/README.md) for installation,
usage, compatibility, features, and all public exports.

The [documentation site](https://shaileshdhokare.github.io/mantine-datatable-lite/)
reuses the interactive playground with Markdown guides, highlighted code, live
demos and a generated API reference. See [the docs setup guide](apps/playground/README.md)
for editing content and publishing to GitHub Pages.

## Examples

[`examples/`](examples) holds standalone apps for local testing and reference,
such as an [employee directory](examples/employee-directory) with server-side
and client-side tables, built with React, Mantine, axios, Express, Kysely, and
SQLite. They install the published package and are not workspaces, so they
never affect the package, the docs build, or root `npm` commands.

## Local development

Use Node.js 24 and npm 11. From the repository root:

```sh
npm ci
npm run dev:playground
```

The playground links the local library workspace (`file:` dependency), so it
always runs the current source. Its `dev` and `build` scripts build the library
first. For live library changes while the playground runs, also start:

```sh
npm run dev:lib
```

Use `npm run build:lib`, `npm test`, and `npm run check:package` to develop and
verify the local library.

```sh
npm run check:release
```

This checks types, library/playground tests, both builds, the packed file list,
the 25 KiB gzip library budget, ESM/CommonJS rendering, consumer TypeScript
resolution, and a Vite build using the installed tarball.

After publishing, `npm run check:published` downloads the matching version from
npm and applies the same consumer checks to that artifact.

## Publishing

Package releases are published manually through the npm CLI. Stable versions
use the `latest` dist-tag; prereleases use their own (`alpha`, or `next` for
release candidates) so `npm install mantine-datatable-lite` keeps resolving the
stable line. `scripts/validate-release.mjs` checks the version against
`publishConfig.tag` before every publish:

```sh
npm run check:release
npm publish --workspace packages/mantine-datatable-lite --access public --dry-run
npm publish --workspace packages/mantine-datatable-lite --access public
npm run check:published
```

For a prerelease, set the matching `publishConfig.tag` and add the same
`--tag alpha` or `--tag next` to both publish commands.

The documentation has a separate GitHub Pages workflow; it does not publish the
npm package.
