# Documentation site

The existing React/Vite playground is the documentation site. It imports the
published `mantine-datatable-lite` npm release, not the local library workspace.
The `alpha` dependency plus the committed lockfile preserves that distinction.

## Develop and build

From the repository root, with Node.js 24:

```sh
npm ci
npm run dev:playground
npm run build:playground
npm run test:playground
```

The dev and build scripts generate `src/docs/generated/api.json` from the
installed package's TypeScript declarations. `npm run docs:generate -w playground`
regenerates it explicitly. Commit the generated JSON with content changes. Props
names, types and required flags come from TypeScript; editorial descriptions
live in `src/docs/propDescriptions.ts`.

## Edit the documentation

- `src/components/DocsLayout.tsx`: Mantine AppShell, header, navigation, footer,
  responsive menu and scroll-aware table of contents.
- `src/docs/navigation.ts`: page groups and links.
- `src/docs/content/*.md`: feature prose and usage snippets rendered with
  `react-markdown` and `remark-gfm`.
- `src/components/CodeBlock.tsx`: Prism light build of `react-syntax-highlighter`,
  registered TSX/JSX, Bash and JSON grammars, light/dark colors and copying.
- `src/pages/*Page.tsx`: existing live scenarios. Scenario selection is stored
  in the route query, for example `#/filtering?scenario=number`.
- `src/examples/*.tsx`: small complete examples; the displayed source is imported
  directly from the same files that execute the demos.
- `src/docs/content/llm.md`: authored guide for AI coding tools. The existing
  `docs:generate` step adds the installed npm declarations and writes identical
  copies to `src/docs/generated/llm.md` (the LLM page) and `public/llm.md` (the
  stable Markdown URL and download). Commit both generated files with edits.
- `src/components/SourceCode.tsx`: lazy source tabs from real playground files,
  including the server adapter and query helper. These show the full playground
  implementation; the short usage blocks focus on the package API.

Keep documentation aligned with the published exports. The current release has
no public headless hook, inverted all-record selection, or DataTable Styles API.
Use the public appearance props and custom render callbacks.

## GitHub Pages

The expected public URL is
`https://shaileshdhokare.github.io/mantine-datatable-lite/`.

1. Push the documentation changes and `.github/workflows/docs.yml` to `master`
   (the repository's default branch).
2. In GitHub **Settings → Pages → Build and deployment**, select **GitHub Actions**
   as the source.
3. Run **Deploy documentation to GitHub Pages** in Actions, or push another docs
   change. The workflow uses `npm ci`, checks the playground adapters, builds the
   npm-backed app and deploys `apps/playground/dist`.
4. Check the deployment job and visit the URL it returns. A local build alone
   does not confirm publication.

Pull requests build and test the docs without deploying. The manual workflow is
also available after the workflow has reached the default branch; choose the
branch you intend to publish and ensure the `github-pages` environment permits it.

`DOCS_BASE_PATH` sets Vite's deployment base; local development defaults to `/`.
The workflow supplies `/<repository-name>/`. HashRouter keeps feature URLs and
refreshes working on static Pages hosting. `employees.json` is fetched relative
to Vite's base, including on the repository subpath.

For a local Pages build in PowerShell:

```powershell
$env:DOCS_BASE_PATH = '/mantine-datatable-lite/'
npm run build:playground
npm exec -w playground -- vite preview --host 127.0.0.1 --port 4173
```

Open `http://localhost:4173/mantine-datatable-lite/`. For a custom domain, set
`DOCS_BASE_PATH` to `/` instead.

The workflow follows [Vite's GitHub Pages deployment guidance](https://vite.dev/guide/static-deploy.html#github-pages).
