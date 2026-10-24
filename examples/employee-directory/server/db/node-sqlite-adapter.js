/**
 * Kysely's SqliteDialect is written for better-sqlite3. This wraps Node's built-in
 * `node:sqlite` database in the small part of that API that Kysely uses, so the
 * example needs no native module and no build step.
 *
 * @param {import('node:sqlite').DatabaseSync} database
 * @returns {import('kysely').SqliteDatabase}
 */
export function nodeSqliteAdapter(database) {
  return {
    close: () => database.close(),
    prepare(sql) {
      const statement = database.prepare(sql);
      return {
        // Statements that return rows (SELECT, or anything with RETURNING) have result columns.
        reader: statement.columns().length > 0,
        // Kysely passes parameters as one array; node:sqlite takes them as separate arguments.
        all: (parameters) => statement.all(...parameters),
        run: (parameters) => statement.run(...parameters),
        iterate: (parameters) => statement.iterate(...parameters),
      };
    },
  };
}
