/** Number of employees the demo seed creates. */
export const SEED_EMPLOYEE_COUNT = 500;

/** Page size used when a table request has none, and the largest page the API returns. */
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

/** Response delay when the client sends no `X-Simulate-Delay` header, and the longest allowed. */
export const DEFAULT_DELAY_MS = 250;
export const MAX_DELAY_MS = 5000;

/**
 * Table fields the browser may filter, search and sort by. Field names come from
 * the client, so anything not listed here is rejected before it reaches SQL.
 * The column defaults to the field name (CamelCasePlugin maps `isActive` to
 * `is_active`). `globalSearch` fields are matched by the toolbar search.
 *
 * @type {import('./utils/table-query.js').FieldMap}
 */
export const EMPLOYEE_TABLE_FIELDS = {
  name: { type: 'string', globalSearch: true },
  email: { type: 'string', globalSearch: true },
  department: { type: 'string', globalSearch: true },
  role: { type: 'string', globalSearch: true },
  city: { type: 'string', globalSearch: true },
  salary: { type: 'number' },
  isActive: { type: 'boolean' },
  joinDate: { type: 'date' },
};
