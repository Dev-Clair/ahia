class ConnectionServiceError extends Error {
  public readonly name;

  public readonly description;

  constructor(message: string, description: string = "") {
    super(message);

    this.name = "CONNECTION SERVICE ERROR: DATABASE";

    this.description = description;

    Error.captureStackTrace(this);
  }
}

export default ConnectionServiceError;
