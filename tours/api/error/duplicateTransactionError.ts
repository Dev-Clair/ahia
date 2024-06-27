class DuplicateTransactionError extends Error {
  public readonly isOperational: Boolean;

  constructor(message: string) {
    super(message);

    this.name = "DuplicateTransactionError";
    this.isOperational = false;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default DuplicateTransactionError;
