/** One table row. */
export type Employee = {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  city: string;
  salary: number;
  isActive: boolean;
  /** A local-midnight Date. The table's date sorting and filters need Date objects. */
  joinDate: Date;
};

/** An employee as JSON from the API, where dates are `YYYY-MM-DD` strings. */
export type EmployeeJson = Omit<Employee, 'joinDate'> & { joinDate: string };

/** One page of a server-side table request. */
export type EmployeePage = { rows: Employee[]; total: number };

/** Extra details for an expanded row, from GET /api/employees/:id/details. */
export type EmployeeDetails = {
  id: number;
  manager: { id: number; name: string; role: string } | null;
  employmentType: 'Full-time' | 'Part-time' | 'Contractor';
  workMode: 'Hybrid' | 'On-site' | 'Remote';
  timeZone: string;
  skills: string[];
  projects: string[];
};

/** Complete choice lists for the server-side table's filters. */
export type FilterOptions = {
  departments: string[];
  roles: string[];
  cities: string[];
};
