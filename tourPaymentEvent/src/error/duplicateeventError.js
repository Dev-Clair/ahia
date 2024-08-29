class DuplicateEventError extends Error {
  name;

  constructor(message) {
    super(message);

    this.name = "DUPLICATE EVENT ERROR";

    Error.captureStackTrace(this);
  }
}

module.exports = DuplicateEventError;
