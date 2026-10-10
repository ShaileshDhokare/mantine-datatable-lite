export const repository = 'https://github.com/ShaileshDhokare/mantine-datatable-lite';
export const npmUrl = 'https://www.npmjs.com/package/mantine-datatable-lite';
export const navigation = [
  { label: 'Get started', items: [
    { id: 'getting-started', label: 'Introduction' }, { id: 'installation', label: 'Installation' },
  ] },
  { label: 'Features', items: [
    { id: 'basic', label: 'Basic table' }, { id: 'sorting', label: 'Sorting' },
    { id: 'filtering', label: 'Filtering' }, { id: 'searching', label: 'Search' },
    { id: 'pagination', label: 'Pagination' }, { id: 'server', label: 'Server-side data' },
    { id: 'selection', label: 'Row selection' }, { id: 'pinning', label: 'Pinning & persistence' },
    { id: 'expandable', label: 'Expandable rows' }, { id: 'row-actions', label: 'Row actions' },
    { id: 'toolbar', label: 'Toolbar & state pills' },
  ] },
  { label: 'Reference', items: [
    { id: 'theming', label: 'Theming' }, { id: 'api', label: 'API reference' },
    { id: 'advanced', label: 'Advanced example' }, { id: 'llm', label: 'LLM' },
  ] },
] as const;
export const allPages = navigation.flatMap((group) => [...group.items]);
