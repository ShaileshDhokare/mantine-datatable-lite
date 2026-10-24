// Employee queries. Everything that touches the employees table lives here.
import { DEFAULT_PAGE_SIZE, EMPLOYEE_TABLE_FIELDS, MAX_PAGE_SIZE } from '../constants.js';
import { db } from '../db/database.js';
import { applyFilters, applySort, getPage } from '../utils/table-query.js';

/**
 * @typedef {Omit<import('../db/database.js').EmployeeTable, 'isActive'> & { isActive: boolean }} Employee
 * @typedef {import('mantine-datatable-lite').TableChange} TableChange
 */

/**
 * The API shape of a row: SQLite stores booleans as 1 and 0.
 *
 * @param {import('../db/database.js').EmployeeTable} row
 * @returns {Employee}
 */
function toEmployee(row) {
  return { ...row, isActive: row.isActive === 1 };
}

/**
 * One page of employees for a server-side table request, and the number of matching rows.
 *
 * @param {TableChange} request
 * @returns {Promise<{ rows: Employee[], total: number }>}
 */
export async function findEmployeePage(request) {
  const matching = applyFilters(db.selectFrom('employees'), request, EMPLOYEE_TABLE_FIELDS);
  const { limit, offset } = getPage(request, {
    defaultPageSize: DEFAULT_PAGE_SIZE,
    maxPageSize: MAX_PAGE_SIZE,
  });

  const [count, rows] = await Promise.all([
    matching.select((eb) => eb.fn.countAll().as('total')).executeTakeFirstOrThrow(),
    applySort(matching.selectAll(), request, EMPLOYEE_TABLE_FIELDS)
      .limit(limit)
      .offset(offset)
      .execute(),
  ]);

  return { rows: rows.map(toEmployee), total: Number(count.total) };
}

/** Every employee, for tables that filter and sort in the browser. */
export async function findAllEmployees() {
  const rows = await db.selectFrom('employees').selectAll().orderBy('id').execute();
  return rows.map(toEmployee);
}

/** @param {number} id */
export async function findEmployeeById(id) {
  const row = await db.selectFrom('employees').selectAll().where('id', '=', id).executeTakeFirst();
  return row ? toEmployee(row) : undefined;
}

/**
 * Complete choice lists for the server-side table's string filters. One page of
 * rows cannot provide them.
 */
export async function findFilterOptions() {
  /** @param {'department' | 'role' | 'city'} column */
  const distinct = async (column) => {
    const rows = await db.selectFrom('employees').select(column).distinct().orderBy(column).execute();
    return rows.map((row) => row[column]);
  };
  const [departments, roles, cities] = await Promise.all([
    distinct('department'),
    distinct('role'),
    distinct('city'),
  ]);
  return { departments, roles, cities };
}

export async function countEmployees() {
  const { total } = await db
    .selectFrom('employees')
    .select((eb) => eb.fn.countAll().as('total'))
    .executeTakeFirstOrThrow();
  return Number(total);
}

/**
 * @param {number[]} ids
 * @param {boolean} isActive
 * @returns {Promise<number>} Number of employees updated.
 */
export async function setEmployeesActive(ids, isActive) {
  const result = await db
    .updateTable('employees')
    .set({ isActive: isActive ? 1 : 0 })
    .where('id', 'in', ids)
    .executeTakeFirst();
  return Number(result.numUpdatedRows);
}

/**
 * @param {number[]} ids
 * @returns {Promise<number>} Number of employees deleted.
 */
export async function deleteEmployees(ids) {
  const result = await db.deleteFrom('employees').where('id', 'in', ids).executeTakeFirst();
  return Number(result.numDeletedRows);
}
