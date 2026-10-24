import express from 'express';
import { errorHandler } from './middleware/error-handler.js';
import { apiRouter } from './routes/index.js';

/** The Express app: JSON bodies, the /api routes, and JSON errors. */
export function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);
  app.use(errorHandler);
  return app;
}
