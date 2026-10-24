import { Router } from 'express';
import {
  deleteMany,
  deleteOne,
  getDetails,
  getEmployee,
  getFilterOptions,
  listEmployees,
  queryEmployees,
  updateStatus,
} from '../controllers/employees.controller.js';

export const employeesRouter = Router();

// Fixed paths come before /:id, which would otherwise match them.
employeesRouter.get('/', listEmployees);
employeesRouter.post('/query', queryEmployees);
employeesRouter.get('/filter-options', getFilterOptions);
employeesRouter.patch('/status', updateStatus);
employeesRouter.delete('/', deleteMany);

employeesRouter.get('/:id', getEmployee);
employeesRouter.get('/:id/details', getDetails);
employeesRouter.delete('/:id', deleteOne);
