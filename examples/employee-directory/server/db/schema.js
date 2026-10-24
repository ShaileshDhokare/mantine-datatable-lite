/**
 * Creates the `employees` table and its indexes when they do not exist yet.
 *
 * @param {import('kysely').Kysely<import('./database.js').Database>} db
 */
export async function createSchema(db) {
  await db.schema
    .createTable('employees')
    .ifNotExists()
    .addColumn('id', 'integer', (column) => column.primaryKey())
    .addColumn('name', 'text', (column) => column.notNull())
    .addColumn('email', 'text', (column) => column.notNull())
    .addColumn('department', 'text', (column) => column.notNull())
    .addColumn('role', 'text', (column) => column.notNull())
    .addColumn('city', 'text', (column) => column.notNull())
    .addColumn('salary', 'integer', (column) => column.notNull())
    .addColumn('isActive', 'integer', (column) => column.notNull())
    .addColumn('joinDate', 'text', (column) => column.notNull())
    .execute();

  await db.schema
    .createIndex('employees_department')
    .ifNotExists()
    .on('employees')
    .column('department')
    .execute();

  await db.schema
    .createIndex('employees_join_date')
    .ifNotExists()
    .on('employees')
    .column('joinDate')
    .execute();
}
