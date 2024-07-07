class DuplicateTransactionError extends Error {
  public readonly isOperational: Boolean;

  constructor(message: string) {
    super(message);

    this.name = "DUPLICATE TRANSACTION ERROR";

    this.isOperational = false;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default DuplicateTransactionError;
