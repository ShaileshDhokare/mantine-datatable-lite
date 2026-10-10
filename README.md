# mantine-datatable-lite

A typed DataTable for **Mantine 9.6+ and React 19.3+**. Version
`0.1.0-alpha.0` is [published on npm](https://www.npmjs.com/package/mantine-datatable-lite)
under the MIT license.

```sh
npm install --save-exact mantine-datatable-lite@alpha
```

See the [package README](packages/mantine-datatable-lite/README.md) for installation,
usage, compatibility, features, and all public exports.

The [documentation site](https://shaileshdhokare.github.io/mantine-datatable-lite/)
reuses the interactive playground with Markdown guides, highlighted code, live
demos and a generated API reference. See [the docs setup guide](apps/playground/README.md)
for editing content and publishing to GitHub Pages.

## Local development

Use Node.js 24 and npm 11. From the repository root:

```sh
npm ci
npm run dev:playground
```

The playground installs `mantine-datatable-lite` from npm's `alpha` tag. The
lockfile records the exact published version. A registry tag keeps npm from
substituting the local library workspace when its version matches.

Use `npm run build:lib`, `npm test`, and `npm run check:package` to develop and
verify the local library. Local library changes reach the playground after a new
alpha is published and its dependency is updated:

```sh
npm update mantine-datatable-lite --workspace playground
```

```sh
npm run check:release
```

This checks types, library/playground tests, both builds, the packed file list,
the 25 KiB gzip library budget, ESM/CommonJS rendering, consumer TypeScript
resolution, and a Vite build using the installed tarball.

After publishing, `npm run check:published` downloads the matching version from
npm and applies the same consumer checks to that artifact.

## Publishing

Package releases are published manually through the npm CLI. The documentation
has a separate GitHub Pages workflow; it does not publish the npm package.
See [RELEASING.md](RELEASING.md) for validation, publishing, and updating the
playground's installed release.
