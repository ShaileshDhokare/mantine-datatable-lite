// Deterministic demo data, so every reset produces the same 500 employees.
import { fileURLToPath } from 'node:url';

const firstNames = [
  'Olivia', 'Liam', 'Ava', 'Noah', 'Sophia', 'Ethan', 'Isabella', 'Mason',
  'Mia', 'James', 'Amelia', 'Lucas', 'Harper', 'Elijah', 'Evelyn', 'Aarav',
  'Priya', 'Hiroshi', 'Yuki', 'Chen', 'Mei', 'Omar', 'Layla', 'Mateo',
  'Lucia', 'Kofi', 'Amara', 'Sven', 'Ingrid', 'Rafael', 'Camila', 'Arjun',
];
const lastNames = [
  'Bennett', 'Carter', 'Patel', 'Williams', 'Nguyen', 'Brooks', 'Garcia',
  'Reed', 'Thompson', 'Wilson', 'Foster', 'Kim', 'Sharma', 'Tanaka', 'Rossi',
  'Okafor', 'Larsen', 'Silva', 'Haddad', 'Novak', 'Murphy', 'Schmidt',
  'Dubois', 'Kowalski', 'Mendes', 'Ivanova', 'Mensah', 'Fischer',
];
const departments = {
  Engineering: ['Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Engineering Manager'],
  Design: ['Product Designer', 'Senior Product Designer', 'Design Director'],
  Product: ['Product Manager', 'Senior Product Manager', 'Product Analyst'],
  Sales: ['Account Executive', 'Sales Manager', 'Sales Development Rep'],
  Marketing: ['Marketing Specialist', 'Content Strategist', 'Marketing Manager'],
  Finance: ['Financial Analyst', 'Accountant', 'Finance Manager'],
  'Customer Support': ['Support Specialist', 'Support Lead', 'Support Manager'],
  Operations: ['Operations Analyst', 'Operations Manager'],
  'Human Resources': ['HR Generalist', 'Recruiter', 'HR Manager'],
  Legal: ['Legal Counsel', 'Paralegal'],
};
const cities = [
  'London', 'Berlin', 'Pune', 'Tokyo', 'Toronto', 'Austin', 'Lisbon',
  'Singapore', 'Sydney', 'Nairobi', 'São Paulo', 'Stockholm',
];

/** Small seeded PRNG (mulberry32). */
export function random(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateEmployees(count = 500) {
  const next = random(20261024);
  const pick = (items) => items[Math.floor(next() * items.length)];
  const departmentNames = Object.keys(departments);
  return Array.from({ length: count }, (_, index) => {
    const first = pick(firstNames);
    const last = pick(lastNames);
    const department = pick(departmentNames);
    const role = pick(departments[department]);
    const senior = /Senior|Staff|Manager|Director|Lead|Counsel/.test(role);
    const salary = Math.round((senior ? 85000 + next() * 85000 : 45000 + next() * 55000) / 500) * 500;
    const joined = new Date(Date.UTC(2012, 0, 1) + Math.floor(next() * 14 * 365) * 86400000);
    return {
      id: index + 1,
      name: `${first} ${last}`,
      email: `${first}.${last}${index + 1}@example.com`.toLowerCase(),
      department,
      role,
      city: pick(cities),
      salary,
      is_active: next() < 0.85 ? 1 : 0,
      join_date: joined.toISOString().slice(0, 10),
    };
  });
}

export function seed(db) {
  const insert = db.prepare(`
    INSERT INTO employees (id, name, email, department, role, city, salary, is_active, join_date)
    VALUES (:id, :name, :email, :department, :role, :city, :salary, :is_active, :join_date)
  `);
  db.exec('BEGIN');
  try {
    db.exec('DELETE FROM employees');
    for (const employee of generateEmployees()) insert.run(employee);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

// `npm run seed` resets the database file.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { db } = await import('./db.js');
  seed(db);
  console.log('Seeded 500 employees.');
}
