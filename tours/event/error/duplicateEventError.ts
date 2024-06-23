class DuplicateEventError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "DuplicateEventError";

    Error.captureStackTrace(this, this.constructor);
  }
}

export default DuplicateEventError;
