import express from 'express';
import { db, toEmployee } from './db.js';
import { BadRequest, buildQuery } from './query.js';
import { seed } from './seed.js';

// API_PORT rather than PORT, which dev tools often set for the web server.
const PORT = Number(process.env.API_PORT ?? 4000);

if (db.prepare('SELECT COUNT(*) AS count FROM employees').get().count === 0) seed(db);

const app = express();
app.use(express.json());

// Demo switches from the UI: `X-Simulate-Delay: <ms>` and `X-Simulate-Error: 1`.
app.use('/api', async (request, response, next) => {
  const delay = Math.min(Number(request.get('x-simulate-delay') ?? 250) || 0, 5000);
  if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
  if (request.get('x-simulate-error') === '1' && request.method === 'POST' && request.path === '/employees/query') {
    response.status(503).json({ message: 'The employee service is unavailable (simulated).' });
    return;
  }
  next();
});

/** One page of employees for a table request: { rows, total }. */
app.post('/api/employees/query', (request, response) => {
  const { where, params, orderBy, limit, offset } = buildQuery(request.body ?? {});
  const { total } = db.prepare(`SELECT COUNT(*) AS total FROM employees ${where}`).get(...params);
  const rows = db
    .prepare(`SELECT * FROM employees ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);
  response.json({ rows: rows.map(toEmployee), total });
});

/** Complete choice lists for the string filters; a single page cannot provide them. */
app.get('/api/employees/filter-options', (_request, response) => {
  const distinct = (column) =>
    db.prepare(`SELECT DISTINCT ${column} AS value FROM employees ORDER BY value`).all().map((row) => row.value);
  response.json({
    departments: distinct('department'),
    roles: distinct('role'),
    cities: distinct('city'),
  });
});

app.get('/api/employees/:id', (request, response) => {
  const row = db.prepare('SELECT * FROM employees WHERE id = ?').get(Number(request.params.id));
  if (!row) {
    response.status(404).json({ message: 'Employee not found' });
    return;
  }
  response.json(toEmployee(row));
});

function ids(body) {
  const list = body?.ids;
  if (!Array.isArray(list) || list.length === 0 || !list.every(Number.isInteger)) {
    throw new BadRequest('Send a non-empty list of numeric ids');
  }
  return list;
}

/** Bulk activate or deactivate. */
app.patch('/api/employees/status', (request, response) => {
  const list = ids(request.body);
  if (typeof request.body.isActive !== 'boolean') throw new BadRequest('isActive must be a boolean');
  const { changes } = db
    .prepare(`UPDATE employees SET is_active = ? WHERE id IN (${list.map(() => '?').join(', ')})`)
    .run(request.body.isActive ? 1 : 0, ...list);
  response.json({ updated: Number(changes) });
});

/** Bulk delete. */
app.delete('/api/employees', (request, response) => {
  const list = ids(request.body);
  const { changes } = db
    .prepare(`DELETE FROM employees WHERE id IN (${list.map(() => '?').join(', ')})`)
    .run(...list);
  response.json({ deleted: Number(changes) });
});

app.delete('/api/employees/:id', (request, response) => {
  const { changes } = db.prepare('DELETE FROM employees WHERE id = ?').run(Number(request.params.id));
  response.json({ deleted: Number(changes) });
});

/** Restores the original 500 employees. */
app.post('/api/demo/reset', (_request, response) => {
  seed(db);
  response.json({ ok: true });
});

// Express 5 forwards thrown errors here, including from synchronous handlers.
app.use((error, _request, response, _next) => {
  if (error instanceof BadRequest || error.type === 'entity.parse.failed') {
    response.status(400).json({ message: error.message });
    return;
  }
  console.error(error);
  response.status(500).json({ message: 'Unexpected server error' });
});

app.listen(PORT, () => {
  console.log(`Employee API listening on http://localhost:${PORT}`);
});
