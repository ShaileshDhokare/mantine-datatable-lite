// Everything under /api.
import { Router } from 'express';
import { apiNotFound } from '../middleware/error-handler.js';
import { simulateNetwork } from '../middleware/simulate-network.js';
import { demoRouter } from './demo.routes.js';
import { employeesRouter } from './employees.routes.js';

export const apiRouter = Router();

apiRouter.use(simulateNetwork);
apiRouter.use('/employees', employeesRouter);
apiRouter.use('/demo', demoRouter);
apiRouter.use(apiNotFound);
