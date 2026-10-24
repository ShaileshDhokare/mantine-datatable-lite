// Deterministic demo data: every reset produces the same employees.
import { SEED_EMPLOYEE_COUNT } from '../constants.js';
import {
  ACTIVE_SHARE,
  CITIES,
  DEPARTMENT_ROLES,
  FIRST_JOIN_DATE,
  FIRST_NAMES,
  JOIN_DATE_SPAN_DAYS,
  LAST_NAMES,
  SALARY_BANDS,
  SENIOR_ROLE,
} from '../data/employees.js';
import { createRandom, pickOne } from '../utils/random.js';

const SEED = 20261024;
const DAY_MS = 86_400_000;

/**
 * @param {number} [count]
 * @returns {import('./database.js').EmployeeTable[]}
 */
export function generateEmployees(count = SEED_EMPLOYEE_COUNT) {
  const random = createRandom(SEED);
  const departments = Object.keys(DEPARTMENT_ROLES);

  // Each employee takes the next values from one random sequence, so the order of
  // these draws matters: changing it changes every generated employee.
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    const first = pickOne(FIRST_NAMES, random);
    const last = pickOne(LAST_NAMES, random);
    const department = pickOne(departments, random);
    const role = pickOne(DEPARTMENT_ROLES[department], random);
    const band = SENIOR_ROLE.test(role) ? SALARY_BANDS.senior : SALARY_BANDS.standard;
    const salary = Math.round((band.min + random() * band.spread) / 500) * 500;
    const joined = new Date(FIRST_JOIN_DATE + Math.floor(random() * JOIN_DATE_SPAN_DAYS) * DAY_MS);
    const city = pickOne(CITIES, random);
    const isActive = random() < ACTIVE_SHARE ? 1 : 0;
    return {
      id,
      name: `${first} ${last}`,
      email: `${first}.${last}${id}@example.com`.toLowerCase(),
      department,
      role,
      city,
      salary,
      isActive,
      joinDate: joined.toISOString().slice(0, 10),
    };
  });
}

/**
 * Replaces every employee with the generated demo data.
 *
 * @param {import('kysely').Kysely<import('./database.js').Database>} db
 * @returns {Promise<number>} Number of employees created.
 */
export async function seedEmployees(db) {
  const employees = generateEmployees();
  await db.transaction().execute(async (transaction) => {
    await transaction.deleteFrom('employees').execute();
    await transaction.insertInto('employees').values(employees).execute();
  });
  return employees.length;
}
