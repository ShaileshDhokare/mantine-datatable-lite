# mantine-datatable-lite

A typed DataTable for **Mantine 9.6+ and React 19.3+**. The first release candidate
is `0.1.0-alpha.0`, prepared for npm's `alpha` channel under the MIT license.

See the [package README](packages/mantine-datatable-lite/README.md) for installation,
usage, compatibility, features, and all public exports.

## Local development

Use Node.js 24 and npm 11. From the repository root:

```sh
npm ci
npm run build:lib
npm run dev:playground
```

In another terminal, use `npm run dev:lib` to rebuild the library on changes.
The playground consumes the local library through npm workspaces.

```sh
npm run check:release
```

This checks types, library/playground tests, both builds, the packed file list,
the 25 KiB gzip library budget, ESM/CommonJS rendering, consumer TypeScript
resolution, and a Vite build using the installed tarball.

## Publishing

See [RELEASING.md](RELEASING.md) for npm account setup, the first publish, trusted
publishing, and installing the published package in another application.
