// Checks for values that arrive in URLs and request bodies.
import { BadRequest } from './errors.js';

/** A positive integer ID from a URL parameter. */
export function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new BadRequest('The id must be a positive integer');
  return id;
}

/** A non-empty list of integer IDs from a request body's `ids`. */
export function parseIds(body) {
  const ids = body?.ids;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every(Number.isInteger)) {
    throw new BadRequest('Send a non-empty list of numeric ids');
  }
  return ids;
}

/** A required boolean from a request body. */
export function parseBoolean(value, name) {
  if (typeof value !== 'boolean') throw new BadRequest(`${name} must be a boolean`);
  return value;
}

/** An optional list from a request body; missing means empty. */
export function parseList(value, name) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new BadRequest(`${name} must be a list`);
  return value;
}
