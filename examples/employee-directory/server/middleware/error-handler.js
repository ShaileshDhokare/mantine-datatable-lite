import { HttpError } from '../utils/errors.js';

/** 404 for API paths that no route handles. */
export function apiNotFound(request, response) {
  response.status(404).json({ message: `No API route for ${request.method} ${request.originalUrl}` });
}

/**
 * Turns thrown errors into JSON responses. Express 5 forwards errors here from
 * both synchronous handlers and rejected promises. Express recognizes an error
 * handler by its four parameters, so `_next` must stay.
 */
export function errorHandler(error, _request, response, _next) {
  if (error instanceof HttpError) {
    response.status(error.status).json({ message: error.message });
    return;
  }
  // Invalid JSON in a request body, from express.json().
  if (error.type === 'entity.parse.failed') {
    response.status(400).json({ message: error.message });
    return;
  }
  console.error(error);
  response.status(500).json({ message: 'Unexpected server error' });
}
