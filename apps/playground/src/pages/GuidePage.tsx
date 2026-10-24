import { Paper, Text } from '@mantine/core';
import { DocsLayout } from '../components/DocsLayout';
import { DocSection } from '../components/DocSection';
import { CodeBlock } from '../components/CodeBlock';
import { Markdown } from '../components/Markdown';
import { PropsTable } from '../components/PropsTable';
import { GettingStarted } from '../examples/GettingStarted';
import gettingStartedCode from '../examples/GettingStarted.tsx?raw';
import { RowActions } from '../examples/RowActions';
import rowActionsCode from '../examples/RowActions.tsx?raw';
import { Toolbar } from '../examples/Toolbar';
import toolbarCode from '../examples/Toolbar.tsx?raw';
import { Theming } from '../examples/Theming';
import themingCode from '../examples/Theming.tsx?raw';
import classes from '../App.module.css';
import { tag, version } from '../docs/generated/api.json';

const guides = {
  'getting-started': {
    title: 'Mantine DataTable Lite', description: 'A typed React table that feels at home in Mantine.',
    overview: 'Build data screens with typed columns, sorting, filters, search, pagination, selection and expandable rows. Features are opt-in, and the table uses your Mantine theme.\n\nStart with `rows` and `columns`. Add column flags for interactions and `pagination` to page local records. When your server owns the data, set `mode="server"` and fetch in `onChange`.\n\n[Install the package](#/installation), then try the example below.',
    code: gettingStartedCode, Demo: GettingStarted,
    notes: 'Click **Name** to sort, or open the **Role** filter and press Apply. The table transforms these local records for you.\n\nEach feature page includes explanations, usage code and configurable live scenarios. Open the Props tab for its API, or visit the [full API reference](#/api). For a complete fetching flow, start with [server-side data](#/server).',
    props: ['columns', 'rows', 'mode', 'pagination', 'onChange'],
  },
  'row-actions': {
    title: 'Row actions', description: 'Add accessible actions without triggering the row click handler.',
    overview: 'Use the public `rowActionsColumn` helper for an action column. It defaults to the Actions heading, an 80 px width and right pinning. Sorting, filtering, search, hiding and pin-menu actions are disabled for this column.\n\nProvide a `render` function and label each icon button. The helper isolates action clicks from `onRowClick` and row-triggered expansion.',
    code: rowActionsCode, Demo: RowActions,
    notes: 'Click a row, then click its details action. The status message shows which handler ran. Customize `header`, `width` or `pinned` in the helper configuration. Import `rowActionsColumn` from `mantine-datatable-lite`.',
    props: ['onRowClick', 'rowProps'],
  },
  toolbar: {
    title: 'Toolbar & state pills', description: 'Compose search, column visibility, applied state and reset controls.',
    overview: 'Enable `globalSearch`, `columnSelector`, `showTableStatePills` and `showReset` independently. They default to false. Column visibility changes are staged until Apply.\n\nState pills describe the active sort, filters and searches. Remove a pill to clear only that operation. `maxChips` limits visible pills and moves the remainder into an overflow control.',
    code: toolbarCode, Demo: Toolbar,
    notes: '**Reset** clears applied sorting, filtering, search and column layout changes. Every column becomes visible again, and pins return to each column\'s `pinned` default.\n\nWhile rows are selected, `selection.renderBulkActions` replaces the toolbar with a bulk action bar. See [row selection](#/selection) for bulk actions and a confirmation modal.',
    props: ['globalSearch', 'columnSelector', 'showTableStatePills', 'showReset', 'maxChips', 'debounceTime', 'labels'],
  },
  theming: {
    title: 'Theming', description: 'Use Mantine colors, spacing and your existing provider.',
    overview: 'The table uses Mantine components and CSS variables. Place it inside your `MantineProvider` to inherit fonts, colors and the current color scheme. Switch the theme in the documentation header to preview light and dark rendering.\n\nCustomize borders, stripes, hover backgrounds and spacing with the public appearance props. CSS variables such as `var(--mantine-color-blue-light)` adapt to both schemes.',
    code: themingCode, Demo: Theming,
    notes: 'Use `render` for custom cells and `rowProps` for additional row attributes or styles. Use `labels` to translate built-in text. The package exposes appearance props; it does not export a DataTable Styles API (`classNames`, `styles`, `vars`) or a headless `useDataTable` hook. See the [API reference](#/api) for the supported contract.',
    props: ['borderColor', 'striped', 'stripedColor', 'highlightOnHover', 'highlightOnHoverColor', 'horizontalSpacing', 'verticalSpacing', 'withTableBorder', 'withColumnBorders', 'withRowBorders', 'rowProps'],
  },
};

export function GuidePage({ guide }: { guide: keyof typeof guides }) {
  const { title, description, overview, code, Demo, notes, props } = guides[guide];
  return <DocsLayout title={title} description={description} toc={[
    { id: 'overview', label: 'Overview' }, { id: 'usage', label: 'Usage' },
    { id: 'demo', label: 'Live example' }, { id: 'details', label: 'How it works' }, { id: 'props', label: 'Related props' },
  ]}>
    <DocSection id='overview' title='Overview'><Markdown>{overview}</Markdown></DocSection>
    <DocSection id='usage' title='Usage'><CodeBlock code={code} label='Demo.tsx' /></DocSection>
    <DocSection id='demo' title='Live example'><Paper withBorder radius='md' className={classes.tablePane}><Demo /></Paper></DocSection>
    <DocSection id='details' title='How it works'><Markdown>{notes}</Markdown></DocSection>
    <DocSection id='props' title='Related props'><PropsTable name='DataTableProps' only={props} /></DocSection>
  </DocsLayout>;
}

export function InstallationPage() {
  return <DocsLayout title='Installation' description='Install the npm package and connect it to your Mantine application.' toc={[
    { id: 'install', label: 'Install dependencies' }, { id: 'styles', label: 'Styles & provider' }, { id: 'next', label: 'Next steps' },
  ]}>
    <DocSection id='install' title='Install dependencies'><Markdown>{`The current release, ${version}, is available under the npm \`${tag}\` tag. The supported peer baseline is React 19.2 and Mantine 9.6 or newer within major version 9. If React and Mantine are already installed, add the table package:

\`\`\`bash
npm install mantine-datatable-lite@${tag}
\`\`\`

For a new React application, install the peer dependencies too:

\`\`\`bash
npm install mantine-datatable-lite@${tag} react@^19.2 react-dom@^19.2 @mantine/core@^9.6 @mantine/hooks@^9.6
\`\`\`

Use the same version for the Mantine packages. The package ships its own TypeScript declarations.

Date filters use the browser's native date input. To use Mantine's date picker instead, install \`@mantine/dates\` and \`dayjs\`, import \`@mantine/dates/styles.css\`, and pass \`dateInput={DatePickerInput}\`.`}</Markdown></DocSection>
    <DocSection id='styles' title='Styles & provider'><Markdown>{`Import Mantine styles before the table stylesheet, then render your app inside \`MantineProvider\`.

\`\`\`tsx
import '@mantine/core/styles.css';
import 'mantine-datatable-lite/styles.css';
import { MantineProvider } from '@mantine/core';

export function Root() {
  return <MantineProvider><App /></MantineProvider>;
}
\`\`\`

In this setup, \`App\` is your application's root component. Keep these stylesheet imports in one application entry file.`}</Markdown></DocSection>
    <DocSection id='next' title='Next steps'><Text mb='md'>Create column definitions and pass your records to the table.</Text><Markdown>{'[Try the getting started example](#/getting-started), explore [basic table styling](#/basic), or connect [server-side data](#/server).'}</Markdown></DocSection>
  </DocsLayout>;
}
