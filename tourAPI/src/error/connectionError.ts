class ConnectionError extends Error {
  public readonly name;

  public readonly description;

  constructor(message: string, description: string = "") {
    super(message);

    this.name = "DATABASE CONNECTION ERROR";

    this.description = description;
  }
}

module.exports = ConnectionError;
