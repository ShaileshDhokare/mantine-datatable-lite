import basic from './content/basic.md?raw';
import sorting from './content/sorting.md?raw';
import filtering from './content/filtering.md?raw';
import searching from './content/searching.md?raw';
import pagination from './content/pagination.md?raw';
import server from './content/server.md?raw';
import selection from './content/selection.md?raw';
import pinning from './content/pinning.md?raw';
import expandable from './content/expandable.md?raw';
import advanced from './content/advanced.md?raw';

export const features = {
  basic: { title: 'Basic table', description: 'Typed columns, custom cells and Mantine table styling.', markdown: basic, files: ['BasicPage.tsx', 'data.ts'], props: ['columns', 'rows', 'minWidth', 'maxHeight', 'stickyHeader', 'striped', 'highlightOnHover', 'withTableBorder', 'withColumnBorders', 'withRowBorders', 'horizontalSpacing', 'verticalSpacing', 'layout'] },
  sorting: { title: 'Sorting', description: 'Sort strings, numbers, dates and booleans with a typed column API.', markdown: sorting, files: ['SortingPage.tsx', 'data.ts'], props: ['mode', 'onChange', 'pagination'] },
  filtering: { title: 'Filtering', description: 'Typed filters with staged edits, Apply and Reset.', markdown: filtering, files: ['FilteringPage.tsx', 'data.ts'], props: ['onChange', 'emptyState', 'dateInput', 'showTableStatePills', 'showReset'] },
  searching: { title: 'Search', description: 'Find records with column terms and debounced global search.', markdown: searching, files: ['SearchingPage.tsx', 'data.ts'], props: ['globalSearch', 'debounceTime', 'showTableStatePills', 'showReset', 'onChange'] },
  pagination: { title: 'Pagination', description: 'Page local records, or control the page, size and total for server data.', markdown: pagination, files: ['PaginationPage.tsx', 'data.ts'], props: ['pagination', 'mode', 'onChange'] },
  server: { title: 'Server-side data', description: 'Your application fetches. The table reports a complete query request.', markdown: server, files: ['ServerPage.tsx', 'useServerData.ts', 'serverEmployees.ts', 'queryEmployees.ts', 'data.ts'], props: ['mode', 'pagination', 'onChange', 'loading', 'loaderProps', 'error', 'onRetry'] },
  selection: { title: 'Row selection', description: 'Select visible rows, preserve selected IDs and compose bulk actions.', markdown: selection, files: ['SelectionPage.tsx', 'data.ts'], props: ['selection', 'idAccessor'] },
  pinning: { title: 'Pinning & persistence', description: 'Keep key columns in view and remember the preferred layout.', markdown: pinning, files: ['PinningPage.tsx', 'data.ts'], props: ['persistKey', 'columnSelector', 'minWidth', 'maxHeight', 'stickyHeader'] },
  expandable: { title: 'Expandable rows', description: 'Add detail panels without leaving the table.', markdown: expandable, files: ['ExpandablePage.tsx', 'data.ts'], props: ['expandable', 'idAccessor', 'onRowClick'] },
  advanced: { title: 'Advanced example', description: 'Explore every major feature together in a complete employee table.', markdown: advanced, files: ['AdvancedPage.tsx', 'data.ts'], props: ['pagination', 'onChange', 'selection', 'expandable', 'globalSearch', 'columnSelector', 'showTableStatePills', 'showReset'] },
};
export type Feature = keyof typeof features;
