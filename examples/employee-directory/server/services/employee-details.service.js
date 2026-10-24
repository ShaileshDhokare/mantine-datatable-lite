// Extra employee details that are not part of the table rows. An expanded row
// loads them on demand. They are derived from the employee's ID, so they stay the
// same across restarts and demo resets.
import { db } from '../db/database.js';
import { CITY_TIME_ZONES, DEPARTMENT_SKILLS, LEADER_TITLES, PROJECTS } from '../data/employee-details.js';
import { createRandom, pickSome } from '../utils/random.js';

/** @typedef {import('./employees.service.js').Employee} Employee */

/**
 * The department's most senior leader other than the employee: a director first,
 * then a manager, then a lead or counsel. Earlier joiners win ties.
 *
 * @param {Employee} employee
 */
function findManager(employee) {
  return db
    .selectFrom('employees')
    .select(['id', 'name', 'role'])
    .where('department', '=', employee.department)
    .where('id', '<>', employee.id)
    .where((eb) => eb.or(LEADER_TITLES.map((title) => eb('role', 'like', `%${title}%`))))
    .orderBy((eb) =>
      eb
        .case()
        .when('role', 'like', '%Director%')
        .then(1)
        .when('role', 'like', '%Manager%')
        .then(2)
        .else(3)
        .end(),
    )
    .orderBy('joinDate')
    .orderBy('id')
    .limit(1)
    .executeTakeFirst();
}

/**
 * Details for an expanded row.
 *
 * @param {Employee} employee
 */
export async function getEmployeeDetails(employee) {
  const random = createRandom(employee.id * 7919);
  const manager = await findManager(employee);
  // The order of the random draws below is part of the data: keep it.
  const employment = random();
  const workMode = random();
  const skillCount = 3 + Math.floor(random() * 2);
  const skills = pickSome(DEPARTMENT_SKILLS[employee.department] ?? [], skillCount, random);
  const projectCount = 1 + Math.floor(random() * 2);
  const projects = pickSome(PROJECTS, projectCount, random);

  return {
    id: employee.id,
    manager: manager ?? null,
    employmentType: employment < 0.82 ? 'Full-time' : employment < 0.94 ? 'Part-time' : 'Contractor',
    workMode: workMode < 0.45 ? 'Hybrid' : workMode < 0.8 ? 'On-site' : 'Remote',
    timeZone: CITY_TIME_ZONES[employee.city] ?? 'UTC',
    skills,
    projects,
  };
}
