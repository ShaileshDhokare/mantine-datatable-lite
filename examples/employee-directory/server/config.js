// Settings that can change per machine, read from environment variables.
import { fileURLToPath } from 'node:url';

/** API port. API_PORT rather than PORT, which dev tools often set for the web server. */
export const API_PORT = Number(process.env.API_PORT ?? 4000);

/** SQLite database file. It is created and seeded on first start. */
export const DATABASE_FILE = fileURLToPath(new URL('../data/employees.db', import.meta.url));
