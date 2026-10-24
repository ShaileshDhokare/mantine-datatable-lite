// Demo switches from the UI: `X-Simulate-Delay: <ms>` slows every response, and
// `X-Simulate-Error: 1` fails the reads behind the tables and expanded rows.
import { DEFAULT_DELAY_MS, MAX_DELAY_MS } from '../constants.js';

/** Reads that fail while errors are simulated. Paths are relative to /api. */
const FAILING_READS = [
  { method: 'POST', path: /^\/employees\/query$/ }, // server-side table page
  { method: 'GET', path: /^\/employees\/?$/ }, // client-side table rows
  { method: 'GET', path: /^\/employees\/\d+\/details$/ }, // expanded row
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function simulateNetwork(request, response, next) {
  const delay = Math.min(Number(request.get('x-simulate-delay') ?? DEFAULT_DELAY_MS) || 0, MAX_DELAY_MS);
  if (delay > 0) await wait(delay);

  const fails = FAILING_READS.some(
    ({ method, path }) => request.method === method && path.test(request.path),
  );
  if (fails && request.get('x-simulate-error') === '1') {
    response.status(503).json({ message: 'The employee service is unavailable (simulated).' });
    return;
  }
  next();
}
