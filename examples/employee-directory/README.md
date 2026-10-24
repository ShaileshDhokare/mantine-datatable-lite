# Employee directory

A complete app that uses `mantine-datatable-lite` two ways, one per tab, against
the same Express + SQLite API:

- **Server-side:** the table sends one request object for every sort, filter,
  search and page change. The API turns it into SQL with Kysely and returns one
  page of employees.
- **Client-side:** every employee loads once. The table sorts, filters, searches
  and pages them in the browser.

The stack:

- **Frontend:** React 19, Mantine 9, axios, Vite
- **Backend:** Node.js, Express 5, [Kysely](https://kysely.dev) on SQLite (Node's
  built-in `node:sqlite`, so there is no native build step)
- **Data:** 500 generated employees, recreated with **Reset demo data**

## Run it

Node.js 22.16 or later. In this folder:

```sh
npm install
npm run dev
```

Open http://localhost:5180. `npm run dev` starts the API on port 4000 and the
Vite app on port 5180, which proxies `/api` to the API. Change the ports with
`API_PORT` and `WEB_PORT`.

The database file is `data/employees.db`. It is created and seeded on first
start; `npm run seed` or the **Reset demo data** button restores the original
rows.

The app installs the published `mantine-datatable-lite` package. To try local
changes to the library, build it from the repository root (`npm install`, then
`npm run build:lib`) and link it here with
`npm install ../../packages/mantine-datatable-lite`. Run `npm install` again
to go back to the published version.

## What each tab shows

### Server-side

| Feature | Where to look |
| --- | --- |
| Server pagination with page size choices | `ServerSideTable.tsx` (`pagination`) |
| Sorting, with a default sort sent in the first request | `serverColumns.tsx` (`sortable`, `defaultSortOrder`) |
| Choice filters with complete option lists from the API | `serverColumns.tsx`, `GET /api/employees/filter-options` |
| Date filters with Mantine's date picker | `serverColumns.tsx`, `ServerSideTable.tsx` (`dateInput`) |
| A custom salary range filter (`renderFilter`) sent as a `between` filter | `components/table/SalaryRangeFilter.tsx` |
| Column search and debounced global search | `serverColumns.tsx` (`searchable`), `ServerSideTable.tsx` (`globalSearch`) |
| Column menu, header buttons, pinning, column picker, saved layout | `serverColumns.tsx`, `ServerSideTable.tsx` (`persistKey`) |
| Controlled selection across pages with bulk activate, deactivate and delete | `ServerSideTable.tsx` (`selection`), `ServerBulkActions.tsx` |
| Expandable rows (icon trigger, several open) that load details from the API | `components/employees/EmployeeDetailsPanel.tsx` |
| Row click and row actions that load the employee by ID | `ServerSideTable.tsx` (`onRowClick`), `serverColumns.tsx` (`rowActionsColumn`) |
| Loading overlay, errors and retry | `useEmployeeQuery.ts`, `ServerSideTable.tsx` |
| `TableChange` → SQL with whitelisted fields and bound parameters | `server/utils/table-query.js` |

### Client-side

| Feature | Where to look |
| --- | --- |
| Rows loaded once; sorting, filtering, search and paging in the browser | `ClientSideTable.tsx` |
| Filter choices taken from the rows (no `filterOptions`) | `clientColumns.tsx` (Department) |
| A computed column (`getValue`) with a custom sort (`sortFn`) | `clientColumns.tsx` (Level), `data/levels.ts` |
| A custom filter (`filterFn`): filter cities by region | `clientColumns.tsx` (Office), `data/regions.ts` |
| A default filter (`defaultFilterValue`) and the built-in number filter | `clientColumns.tsx` (Status, Salary) |
| Search highlighting in default cells | `clientColumns.tsx` (Name, Email) |
| Uncontrolled selection with bulk actions on `loadedRows`: copy emails, export CSV | `ClientBulkActions.tsx` |
| Expandable rows opened by clicking the row (`trigger: 'row'`), one at a time | `ClientSideTable.tsx` (`expandable`) |
| Table state from `onChange`, even though nothing is fetched | `ClientSideTable.tsx` |

Both tabs share the empty state, the drawer, the AA-contrast theme and the demo
switches. The two switches above the tabs send `X-Simulate-Delay` and
`X-Simulate-Error` headers, so you can see the loading states and the retry
actions of both tables and of expanded rows.

Inactive tabs stay mounted, hidden with React's `Activity`. Each table keeps its
sort, filters, page and selection, and reloads its data when its tab opens
again, so changes made in one tab show up in the other.

## Project structure

```text
employee-directory/
├── server/                     Express API
│   ├── index.js                Starts the API: creates the schema, seeds, listens
│   ├── app.js                  Express app: JSON body parsing, /api routes, errors
│   ├── config.js               Environment settings (port, database file)
│   ├── constants.js            Limits, delays, and the table fields the API accepts
│   ├── routes/                 URL → controller
│   ├── controllers/            Read and check the request, call a service, send JSON
│   ├── services/               Kysely queries
│   ├── middleware/             Simulated delay and errors, JSON errors, 404
│   ├── db/                     Kysely + node:sqlite connection, schema, seed
│   ├── data/                   Source lists for the demo data
│   ├── utils/                  TableChange → Kysely, validation, errors, random
│   └── scripts/seed.js         `npm run seed`
└── src/                        React app
    ├── main.tsx                Providers and styles
    ├── App.tsx                 Header, demo switches, tabs
    ├── theme.ts                Mantine theme with AA contrast
    ├── features/
    │   ├── server-side/        Server-side table, its columns, bulk actions, query hook
    │   └── client-side/        Client-side table, its columns, bulk actions
    ├── components/
    │   ├── layout/             Header, theme toggle, demo switches, tab intro
    │   ├── employees/          Drawer, expanded row panel, delete dialog, badges
    │   └── table/              Custom salary filter, TableChange preview
    ├── hooks/                  Data loading, actions with notifications, row details
    ├── api/                    axios client and employee endpoints
    ├── types/                  Employee types
    ├── constants/              API, app and table settings
    ├── data/                   Levels and regions for the client-side columns
    └── utils/                  Formatting, dates, CSV, notifications
```

## How the server-side tab fits together

1. The table runs with `mode="server"` and `onChange={setRequest}`. It reports
   its initial request on mount, including the default sort on **Joined**, so
   the app needs no separate initial fetch (`useEmployeeQuery.ts`).
2. Each request is sent to `POST /api/employees/query` with axios. A newer
   request aborts the previous one. The last good page stays visible while
   loading; after an error the table shows the message and **Retry** in place
   of the rows.
3. Date filters hold `Date` objects. `api/employees.ts` sends them as
   `YYYY-MM-DD` calendar days, because `JSON.stringify` would send UTC
   timestamps that can fall on the previous day.
4. `server/utils/table-query.js` checks each field against
   `EMPLOYEE_TABLE_FIELDS` in `server/constants.js`, then builds the `WHERE`,
   `ORDER BY` and `LIMIT/OFFSET` clauses with Kysely. Values are always bound
   parameters, and anything unknown is rejected with `400 Bad Request`.
5. Kysely's SQLite dialect expects the better-sqlite3 driver.
   `server/db/node-sqlite-adapter.js` adapts Node's built-in `node:sqlite` to it,
   and `CamelCasePlugin` maps `is_active` to `isActive`.

## API

| Method and path | Body | Response |
| --- | --- | --- |
| `GET /api/employees` | | every employee |
| `POST /api/employees/query` | `TableChange` | `{ rows, total }` |
| `GET /api/employees/filter-options` | | `{ departments, roles, cities }` |
| `GET /api/employees/:id` | | employee |
| `GET /api/employees/:id/details` | | `{ manager, employmentType, workMode, timeZone, skills, projects }` |
| `PATCH /api/employees/status` | `{ ids, isActive }` | `{ updated }` |
| `DELETE /api/employees` | `{ ids }` | `{ deleted }` |
| `DELETE /api/employees/:id` | | `{ deleted }` |
| `POST /api/demo/reset` | | `{ ok, employees }` |

This folder is not part of the npm package or the documentation site. It is
only for local testing and as a reference.
