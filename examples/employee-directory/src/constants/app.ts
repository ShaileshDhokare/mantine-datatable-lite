export const APP_TITLE = 'Employee directory';

/** One tab per example. */
export const EXAMPLE_TABS = ['server-side', 'client-side'] as const;
export type ExampleTab = (typeof EXAMPLE_TABS)[number];
export const DEFAULT_TAB: ExampleTab = 'server-side';

export const isExampleTab = (value: unknown): value is ExampleTab =>
  EXAMPLE_TABS.includes(value as ExampleTab);

/** localStorage keys. Each table saves its own hidden and pinned columns. */
export const STORAGE_KEYS = {
  activeTab: 'employee-directory:active-tab',
  serverTableLayout: 'employee-directory:server-side-table',
  clientTableLayout: 'employee-directory:client-side-table',
} as const;

/** Success notifications close after this many milliseconds. Errors stay until dismissed. */
export const NOTIFICATION_AUTO_CLOSE_MS = 4000;
