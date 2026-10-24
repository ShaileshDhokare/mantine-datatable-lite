// `npm run seed`: restores the demo employees in the database file.
import { db } from '../db/database.js';
import { createSchema } from '../db/schema.js';
import { seedEmployees } from '../db/seed.js';

await createSchema(db);
const count = await seedEmployees(db);
await db.destroy();
console.log(`Seeded ${count} employees.`);
