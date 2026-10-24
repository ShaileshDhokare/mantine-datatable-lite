import { Router } from 'express';
import { resetDemoData } from '../controllers/demo.controller.js';

export const demoRouter = Router();

demoRouter.post('/reset', resetDemoData);
