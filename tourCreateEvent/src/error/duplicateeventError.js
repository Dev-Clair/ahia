class DuplicateEventError extends Error {
  name;

  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "DUPLICATE EVENT ERROR";

    Error.captureStackTrace(this);
  }
}

module.exports = DuplicateEventError;
