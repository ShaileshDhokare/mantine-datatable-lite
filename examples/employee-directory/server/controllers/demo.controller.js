// Request handlers for /api/demo.
import { db } from '../db/database.js';
import { seedEmployees } from '../db/seed.js';

/** POST /api/demo/reset: restores the original demo employees. */
export async function resetDemoData(_request, response) {
  const employees = await seedEmployees(db);
  response.json({ ok: true, employees });
}
