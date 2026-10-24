// The API's single database connection: SQLite through Kysely.
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { CamelCasePlugin, Kysely, SqliteDialect } from 'kysely';
import { DATABASE_FILE } from '../config.js';
import { nodeSqliteAdapter } from './node-sqlite-adapter.js';

/**
 * One row of the `employees` table, as Kysely sees it. Columns are snake_case in
 * SQLite (`is_active`, `join_date`); CamelCasePlugin converts names both ways.
 *
 * @typedef {object} EmployeeTable
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} department
 * @property {string} role
 * @property {string} city
 * @property {number} salary
 * @property {0 | 1} isActive SQLite has no boolean type.
 * @property {string} joinDate `YYYY-MM-DD`, so text comparison orders dates.
 */

/** @typedef {{ employees: EmployeeTable }} Database */

mkdirSync(dirname(DATABASE_FILE), { recursive: true });

/** @type {Kysely<Database>} */
export const db = new Kysely({
  dialect: new SqliteDialect({ database: nodeSqliteAdapter(new DatabaseSync(DATABASE_FILE)) }),
  plugins: [new CamelCasePlugin()],
});
