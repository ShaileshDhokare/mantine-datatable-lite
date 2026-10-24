/** An error with an HTTP status. The error handler sends its message to the client. */
export class HttpError extends Error {
  /**
   * @param {number} status
   * @param {string} message
   */
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export class BadRequest extends HttpError {
  /** @param {string} message */
  constructor(message) {
    super(400, message);
  }
}

export class NotFound extends HttpError {
  /** @param {string} message */
  constructor(message) {
    super(404, message);
  }
}
