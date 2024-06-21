class CommandError extends Error {
  public readonly isOperational: Boolean;

  constructor(message: string) {
    super(message);

    this.name = "CommandError";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default CommandError;
