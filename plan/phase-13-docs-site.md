# Phase 13 — Documentation site

Implemented on the existing `apps/playground` React/Vite application using the
published npm package. This follows the requested approach instead of the
original Astro/Starlight proposal.

## Delivered

- Mantine AppShell with header, grouped navigation and scenario submenus,
  article footer, desktop table of contents and mobile burger navigation.
- Markdown explanations and JSX/TSX code rendering through `react-markdown`,
  `remark-gfm` and the light Prism build of `react-syntax-highlighter`.
- Existing feature demos with inline configurable controls and shareable
  scenario URLs. Source tabs import the real page/data/helper files lazily and
  support copy and expand/collapse.
- Introduction, installation, row actions, toolbar, theming and API pages.
- Props tables generated from the installed release's TypeScript declarations.
  Descriptions are editorial; types and required flags are generated.
- GitHub Pages workflow with PR build checks, `master` deployment and a manual
  trigger. Repository-subpath assets use `DOCS_BASE_PATH`; routes use HashRouter.

## Public API boundaries

Document the current published exports rather than every proposed capability
in the historical specification. No public `useDataTable` hook, inverted all-row
selection, or DataTable `classNames`/`styles`/`vars` API is advertised.

The server demo is a static JSON adapter with complete request parameters. It
demonstrates caller-owned fetching and applies operations locally because GitHub
Pages is static hosting. It is not a deployed database-backed API.

## Validation

Playground TypeScript checking and production builds pass. The five adapter
tests pass. Browser checks cover desktop structure, scenario navigation,
generated Props tabs, source tabs, expand/collapse, light/dark rendering and
mobile navigation without page-level horizontal overflow.

Deployment configuration is ready. Publication requires the workflow on GitHub
and the repository Pages source configured to GitHub Actions; track the actual
deployment result separately from local build success.

See `apps/playground/README.md` for editing and deployment instructions.
