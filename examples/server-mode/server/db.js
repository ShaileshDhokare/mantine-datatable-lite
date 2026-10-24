// SQLite through Node's built-in driver (node:sqlite, Node 22.13+): no native build step.
import { mkdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const dataDir = fileURLToPath(new URL('../data/', import.meta.url));
mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(`${dataDir}employees.db`);

db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT NOT NULL,
    role TEXT NOT NULL,
    city TEXT NOT NULL,
    salary INTEGER NOT NULL,
    is_active INTEGER NOT NULL,
    join_date TEXT NOT NULL -- YYYY-MM-DD, so text comparison orders dates
  );
  CREATE INDEX IF NOT EXISTS employees_department ON employees (department);
  CREATE INDEX IF NOT EXISTS employees_join_date ON employees (join_date);
`);

/** API shape: camelCase and real booleans. */
export function toEmployee(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    department: row.department,
    role: row.role,
    city: row.city,
    salary: row.salary,
    isActive: row.is_active === 1,
    joinDate: row.join_date,
  };
}
