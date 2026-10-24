# Server mode example: employee directory

A complete app that uses `mantine-datatable-lite` in **server mode**. The table
sends one request object for every change. An Express API turns it into SQL
against a SQLite database, and returns one page of employees.

- **Frontend:** React 19, Mantine 9, axios, Vite
- **Backend:** Node.js, Express 5, SQLite (Node's built-in `node:sqlite`, so no
  native build step)
- **Data:** 500 generated employees, recreated with **Reset demo data**

It covers every table feature that works with server data:

| Feature | Where to look |
| --- | --- |
| Server pagination with page size choices | `App.tsx` (`pagination`) |
| Sorting, with a default sort sent in the first request | `columns.tsx` (`sortable`, `defaultSortOrder`) |
| Choice filters with complete option lists from the API | `columns.tsx`, `GET /api/employees/filter-options` |
| Number and date filters, with Mantine's date picker | `columns.tsx`, `App.tsx` (`dateInput`) |
| Column search and debounced global search | `columns.tsx` (`searchable`), `App.tsx` (`globalSearch`) |
| Column menu, header buttons, pinning, column picker, saved layout | `columns.tsx`, `App.tsx` (`persistKey`) |
| State pills and reset | `App.tsx` (`showTableStatePills`, `showReset`) |
| Selection across pages with bulk activate, deactivate and delete | `App.tsx` (`selection`) |
| Expandable rows, row actions, row click | `App.tsx`, `columns.tsx` (`rowActionsColumn`) |
| Loading overlay, errors and retry | `useEmployeeQuery.ts`, `App.tsx` |
| `TableChange` → SQL, with whitelisted fields and parameters | `server/query.js` |

## Run it

The example uses the library from this repository (`file:../../packages/mantine-datatable-lite`),
so build the library first. From the repository root:

```sh
npm install
npm run build:lib
```

Then, in this folder (Node.js 22.13 or later):

```sh
npm install
npm run dev
```

Open http://localhost:5180. `npm run dev` starts the API on port 4000 (change it with `API_PORT` and the proxy in `vite.config.ts`) and the
Vite app on port 5180, which proxies `/api` to the API. To pick up library
changes while the example runs, also run `npm run dev:lib` from the repository
root.

The database file is `data/employees.db`. It is created and seeded on first
start; `npm run seed` or the **Reset demo data** button restores the original
rows.

## How it fits together

1. The table runs with `mode="server"` and `onChange={setRequest}`. It reports
   its initial request on mount, including the default sort on **Joined**, so
   the app needs no separate initial fetch (`useEmployeeQuery.ts`).
2. Each request is sent to `POST /api/employees/query` with axios. A newer
   request aborts the previous one, and the last good page stays visible while
   loading or after an error.
3. Date filters hold `Date` objects. `api.ts` sends them as `YYYY-MM-DD`
   calendar days, because `JSON.stringify` would send UTC timestamps that can
   fall on the previous day.
4. `server/query.js` maps each field to a known column, builds `WHERE`,
   `ORDER BY` and `LIMIT/OFFSET` clauses with bound parameters, and rejects
   anything else with `400 Bad Request`.

The two switches above the table send `X-Simulate-Delay` and
`X-Simulate-Error` headers, so you can see the loading overlay and the retry
action.

## API

| Method and path | Body | Response |
| --- | --- | --- |
| `POST /api/employees/query` | `TableChange` | `{ rows, total }` |
| `GET /api/employees/filter-options` | | `{ departments, roles, cities }` |
| `GET /api/employees/:id` | | employee |
| `PATCH /api/employees/status` | `{ ids, isActive }` | `{ updated }` |
| `DELETE /api/employees` | `{ ids }` | `{ deleted }` |
| `DELETE /api/employees/:id` | | `{ deleted }` |
| `POST /api/demo/reset` | | `{ ok }` |

This folder is not part of the npm package or the documentation site. It is
only for local testing and as a reference.
