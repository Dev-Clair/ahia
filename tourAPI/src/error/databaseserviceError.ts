class DatabaseServiceError extends Error {
  public readonly name;

  public readonly description;

  constructor(message: string, description: string = "") {
    super(message);

    this.name = "DATABASE SERVICE: CONNECTION ERROR";

    this.description = description;
  }
}

export default DatabaseServiceError;
