# Examples

Standalone apps built with `mantine-datatable-lite`. Each one has its own
`package.json` and `node_modules`, and links the library from
`../../packages/mantine-datatable-lite`. They are not npm workspaces of this
repository, so they are never installed, linted, built, or published with the
library or the documentation site.

| Example | Stack |
| --- | --- |
| [server-mode](server-mode) | React, Mantine, axios · Node.js, Express, SQLite |

Build the library once from the repository root (`npm install`, then
`npm run build:lib`) before running an example.
