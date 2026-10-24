// Starts the API: prepares the database, then listens.
import { createApp } from './app.js';
import { API_PORT } from './config.js';
import { db } from './db/database.js';
import { createSchema } from './db/schema.js';
import { seedEmployees } from './db/seed.js';
import { countEmployees } from './services/employees.service.js';

await createSchema(db);
if ((await countEmployees()) === 0) await seedEmployees(db);

createApp().listen(API_PORT, () => {
  console.log(`Employee API listening on http://localhost:${API_PORT}`);
});
