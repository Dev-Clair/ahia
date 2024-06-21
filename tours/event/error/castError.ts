class CastError extends Error {
  public readonly isOperational: Boolean;

  constructor(message: string) {
    super(message);

    this.name = "CastError";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default CastError;
