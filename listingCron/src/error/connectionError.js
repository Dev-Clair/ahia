class ConnectionError extends Error {
  name;

  description;

  constructor(message, description = "") {
    super(message);

    this.name = "DATABASE CONNECTION ERROR";

    this.description = description;
  }
}

module.exports = ConnectionError;
