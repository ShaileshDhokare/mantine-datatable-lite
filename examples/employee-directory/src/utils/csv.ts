import type { Employee } from '../types/employee';
import { toCalendarDay } from './dates';

const COLUMNS: [header: string, value: (employee: Employee) => string | number][] = [
  ['ID', (employee) => employee.id],
  ['Name', (employee) => employee.name],
  ['Email', (employee) => employee.email],
  ['Department', (employee) => employee.department],
  ['Role', (employee) => employee.role],
  ['City', (employee) => employee.city],
  ['Salary', (employee) => employee.salary],
  ['Status', (employee) => (employee.isActive ? 'Active' : 'Inactive')],
  ['Joined', (employee) => toCalendarDay(employee.joinDate)],
];

/** Quotes a cell when it contains a comma, quote or line break. */
function cell(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function employeesToCsv(employees: Employee[]): string {
  const header = COLUMNS.map(([name]) => cell(name)).join(',');
  const rows = employees.map((employee) =>
    COLUMNS.map(([, value]) => cell(value(employee))).join(','),
  );
  return [header, ...rows].join('\r\n');
}

/** Saves text as a file through a temporary download link. */
export function downloadTextFile(fileName: string, text: string, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  // Revoke after the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
