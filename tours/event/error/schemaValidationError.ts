class SchemaValidationError extends Error {
  public readonly isOperational: Boolean;
  public readonly errors: any;

  constructor(message: string, errors: any) {
    super(message);

    this.name = "SchemaValidationError";
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default SchemaValidationError;
