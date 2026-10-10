# Publishing an alpha release

Release candidate: **mantine-datatable-lite@0.1.0-alpha.0**.

## One-time prerequisites

1. Create an account at [npmjs.com](https://www.npmjs.com/signup), verify your
   email, and enable two-factor authentication. A public package does not need a
   paid npm plan. Keep your password and authentication codes out of chat and Git.
2. Choose the package license. Set `license` in the library's `package.json` and
   include its full text in `packages/mantine-datatable-lite/LICENSE`.
3. Push the reviewed release files to
   [ShaileshDhokare/mantine-datatable-lite](https://github.com/ShaileshDhokare/mantine-datatable-lite).
   The workflow uses this exact repository URL for npm trusted publishing.

The name has no existing public registry record as of 2026-10-10. npm makes the
final availability/ownership check during publication.

## Verify locally

Use Node.js 24 and npm 11, then run from the repository root:

```powershell
npm ci
node scripts/validate-release.mjs
npm run check:release
npm publish --workspace packages/mantine-datatable-lite --access public --tag alpha --dry-run
```

The dry run builds the package and lists the files without uploading it.
`validate-release.mjs` blocks publishing if the license is missing, the package
is private, the name is still a placeholder, the version is not alpha, or a
release Git tag does not match the package version.

`check:release` runs the library/playground tests and builds. It installs the
packed tarball into an isolated consumer fixture, verifies all public types
under Bundler and NodeNext, renders the ESM and CommonJS entry points, builds a
Vite consumer including the CSS export, checks the packed file list, and enforces
the 25 KiB gzip library JS + CSS budget. Existing workspace peers are reused for
these checks, so this is verification of the tested versions, not every version
allowed by the peer ranges.

## First publish

Trusted publishing requires an existing npm package, so authenticate and publish
the first release interactively in your own terminal:

```powershell
npm login --registry=https://registry.npmjs.org
npm whoami --registry=https://registry.npmjs.org
npm publish --workspace packages/mantine-datatable-lite --access public --tag alpha
```

Complete the browser login and 2FA prompts yourself. No password or npm token
needs to be put in this repository. `prepack` builds fresh assets before publish.
The `alpha` dist-tag is also set in `publishConfig`; keep using the explicit flag.

Verify the uploaded version:

```powershell
npm view mantine-datatable-lite@alpha version dist-tags peerDependencies
```

Record the first published commit with tag `v0.1.0-alpha.0`. The workflow checks
the registry and skips uploading a version that is already published, so pushing
this bootstrap tag or rerunning a successful release is safe.

## Configure GitHub trusted publishing

After the first publish, open the npm package's Settings → Trusted publishing
and add GitHub Actions with these exact values:

| Field | Value |
| --- | --- |
| Organization/user | `ShaileshDhokare` |
| Repository | `mantine-datatable-lite` |
| Workflow filename | `publish.yml` |
| Environment | Leave empty; the workflow declares no environment |
| Allowed action | Enable direct `npm publish` |

The workflow grants `id-token: write` and runs on GitHub-hosted Ubuntu with Node
24 and npm 11. It does not need an `NPM_TOKEN` repository secret. New trusted
publisher configurations must complete a successful publish within two days;
configure it when your next alpha release is ready.

For a public repository/package, trusted publishing generates provenance
automatically. Private repositories can use trusted publishing, but do not get
the same public provenance attestation.

Sources: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/),
[npm trust prerequisites](https://docs.npmjs.com/cli/v11/commands/npm-trust/),
[public packages](https://docs.npmjs.com/about-public-packages/).

## Subsequent alphas

1. Change the library version and matching playground dependency to, for example,
   `0.1.0-alpha.1`. Update release notes/README as appropriate.
2. Run `npm install --package-lock-only --ignore-scripts` to update the lockfile,
   then `npm install --ignore-scripts` to refresh the local workspace link.
3. Run `node scripts/validate-release.mjs` and `npm run check:release`.
4. Commit and push the reviewed files, then create and push the matching tag:

   ```powershell
   git tag v0.1.0-alpha.1
   git push origin v0.1.0-alpha.1
   ```

CI runs on pull requests and `master` pushes. Publishing runs on alpha tags or a
manual Actions dispatch and repeats the release checks before publishing.
Every publish requires a new version. For stable releases, deliberately change
the alpha-only validation, workflow trigger, and dist-tag together.

## Install in a playground/application

In a **separate application**, after npm confirms the release:

```powershell
npm install --save-exact mantine-datatable-lite@alpha
```

Then use the public imports:

```tsx
import { DataTable, type DataTableColumn } from 'mantine-datatable-lite';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-datatable-lite/styles.css';
```

Supply the documented peers and a `MantineProvider`.

The existing `apps/playground` is an npm workspace development consumer. npm
links the local library when its name/version matches, even after publication.
It is already wired to the final public name. To verify registry installation,
use a separate app outside this workspace; an install command inside the
workspace can continue to resolve the local link.
