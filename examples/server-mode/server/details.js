// Extra employee details that are not part of the table rows. The expanded row
// loads them on demand. They are derived from the employee's ID, so they stay the
// same across restarts and demo resets.
import { random } from './seed.js';

const timeZones = {
  London: 'Europe/London',
  Berlin: 'Europe/Berlin',
  Pune: 'Asia/Kolkata',
  Tokyo: 'Asia/Tokyo',
  Toronto: 'America/Toronto',
  Austin: 'America/Chicago',
  Lisbon: 'Europe/Lisbon',
  Singapore: 'Asia/Singapore',
  Sydney: 'Australia/Sydney',
  Nairobi: 'Africa/Nairobi',
  'São Paulo': 'America/Sao_Paulo',
  Stockholm: 'Europe/Stockholm',
};

const skills = {
  Engineering: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Kubernetes', 'Go', 'GraphQL', 'AWS'],
  Design: ['Figma', 'Design systems', 'Prototyping', 'User research', 'Accessibility', 'Motion'],
  Product: ['Roadmapping', 'Discovery', 'Analytics', 'SQL', 'Experimentation', 'Pricing'],
  Sales: ['Negotiation', 'Salesforce', 'Forecasting', 'Enterprise deals', 'Prospecting'],
  Marketing: ['SEO', 'Copywriting', 'Lifecycle email', 'Paid social', 'Brand', 'Events'],
  Finance: ['Forecasting', 'Excel', 'Revenue recognition', 'Budgeting', 'Audit'],
  'Customer Support': ['Zendesk', 'Escalations', 'Onboarding', 'Knowledge base', 'Retention'],
  Operations: ['Process design', 'Vendor management', 'Logistics', 'Reporting'],
  'Human Resources': ['Recruiting', 'Compensation', 'Onboarding', 'Employee relations'],
  Legal: ['Contracts', 'Privacy', 'Compliance', 'Employment law', 'Licensing'],
};

const projects = [
  'Billing platform v2', 'Mobile app redesign', 'EU data residency', 'Partner portal',
  'Customer health score', 'Self-serve onboarding', 'Q3 hiring plan', 'SOC 2 renewal',
  'Pricing refresh', 'Support automation', 'Warehouse migration', 'Annual planning',
];

/** Details for one employee row from the database. */
export function employeeDetails(db, row) {
  const next = random(row.id * 7919);
  // Fisher-Yates shuffle with the seeded generator, then the first `count` items.
  const pickSome = (items, count) => {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const other = Math.floor(next() * (index + 1));
      [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
    }
    return shuffled.slice(0, count);
  };
  // The department's most senior leader: a director, then a manager, lead or counsel.
  const manager = db
    .prepare(
      `SELECT id, name, role,
         CASE
           WHEN role LIKE '%Director%' THEN 1
           WHEN role LIKE '%Manager%' THEN 2
           WHEN role LIKE '%Lead%' OR role LIKE '%Counsel%' THEN 3
         END AS rank
       FROM employees
       WHERE department = ? AND id <> ? AND rank IS NOT NULL
       ORDER BY rank, join_date, id
       LIMIT 1`,
    )
    .get(row.department, row.id);
  const employment = next();
  const workMode = next();
  return {
    id: row.id,
    manager: manager ? { id: manager.id, name: manager.name, role: manager.role } : null,
    employmentType: employment < 0.82 ? 'Full-time' : employment < 0.94 ? 'Part-time' : 'Contractor',
    workMode: workMode < 0.45 ? 'Hybrid' : workMode < 0.8 ? 'On-site' : 'Remote',
    timeZone: timeZones[row.city] ?? 'UTC',
    skills: pickSome(skills[row.department] ?? [], 3 + Math.floor(next() * 2)),
    projects: pickSome(projects, 1 + Math.floor(next() * 2)),
  };
}
