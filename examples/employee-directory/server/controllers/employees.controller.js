// Request handlers for /api/employees: read and check the request, call the
// service, send JSON. Express 5 passes rejected promises to the error handler.
import { getEmployeeDetails } from '../services/employee-details.service.js';
import * as employees from '../services/employees.service.js';
import { NotFound } from '../utils/errors.js';
import { parseBoolean, parseId, parseIds } from '../utils/validation.js';

async function findEmployeeOrFail(id) {
  const employee = await employees.findEmployeeById(parseId(id));
  if (!employee) throw new NotFound('Employee not found');
  return employee;
}

/** POST /api/employees/query with a TableChange: one page for the server-side table. */
export async function queryEmployees(request, response) {
  response.json(await employees.findEmployeePage(request.body ?? {}));
}

/** GET /api/employees: every employee, for the client-side table. */
export async function listEmployees(_request, response) {
  response.json(await employees.findAllEmployees());
}

/** GET /api/employees/filter-options: choices for the server-side table's filters. */
export async function getFilterOptions(_request, response) {
  response.json(await employees.findFilterOptions());
}

/** GET /api/employees/:id */
export async function getEmployee(request, response) {
  response.json(await findEmployeeOrFail(request.params.id));
}

/** GET /api/employees/:id/details: extra details for an expanded row. */
export async function getDetails(request, response) {
  const employee = await findEmployeeOrFail(request.params.id);
  response.json(await getEmployeeDetails(employee));
}

/** PATCH /api/employees/status with { ids, isActive }: bulk activate or deactivate. */
export async function updateStatus(request, response) {
  const ids = parseIds(request.body);
  const isActive = parseBoolean(request.body.isActive, 'isActive');
  response.json({ updated: await employees.setEmployeesActive(ids, isActive) });
}

/** DELETE /api/employees with { ids }: bulk delete. */
export async function deleteMany(request, response) {
  response.json({ deleted: await employees.deleteEmployees(parseIds(request.body)) });
}

/** DELETE /api/employees/:id */
export async function deleteOne(request, response) {
  response.json({ deleted: await employees.deleteEmployees([parseId(request.params.id)]) });
}
