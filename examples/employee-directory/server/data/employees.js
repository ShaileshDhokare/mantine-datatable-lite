// Source lists for the generated demo employees.

export const FIRST_NAMES = [
  'Olivia', 'Liam', 'Ava', 'Noah', 'Sophia', 'Ethan', 'Isabella', 'Mason',
  'Mia', 'James', 'Amelia', 'Lucas', 'Harper', 'Elijah', 'Evelyn', 'Aarav',
  'Priya', 'Hiroshi', 'Yuki', 'Chen', 'Mei', 'Omar', 'Layla', 'Mateo',
  'Lucia', 'Kofi', 'Amara', 'Sven', 'Ingrid', 'Rafael', 'Camila', 'Arjun',
];

export const LAST_NAMES = [
  'Bennett', 'Carter', 'Patel', 'Williams', 'Nguyen', 'Brooks', 'Garcia',
  'Reed', 'Thompson', 'Wilson', 'Foster', 'Kim', 'Sharma', 'Tanaka', 'Rossi',
  'Okafor', 'Larsen', 'Silva', 'Haddad', 'Novak', 'Murphy', 'Schmidt',
  'Dubois', 'Kowalski', 'Mendes', 'Ivanova', 'Mensah', 'Fischer',
];

/** Each department and the roles in it. */
export const DEPARTMENT_ROLES = {
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

/** Roles paid on the senior salary band. */
export const SENIOR_ROLE = /Senior|Staff|Manager|Director|Lead|Counsel/;

/** Salary bands in USD, before rounding to the nearest 500. */
export const SALARY_BANDS = {
  senior: { min: 85_000, spread: 85_000 },
  standard: { min: 45_000, spread: 55_000 },
};

export const CITIES = [
  'London', 'Berlin', 'Pune', 'Tokyo', 'Toronto', 'Austin', 'Lisbon',
  'Singapore', 'Sydney', 'Nairobi', 'São Paulo', 'Stockholm',
];

/** Share of employees that are active. */
export const ACTIVE_SHARE = 0.85;

/** Join dates fall in the 14 years from this day. */
export const FIRST_JOIN_DATE = Date.UTC(2012, 0, 1);
export const JOIN_DATE_SPAN_DAYS = 14 * 365;
