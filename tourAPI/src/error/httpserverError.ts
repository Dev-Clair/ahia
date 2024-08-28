class HttpServerError extends Error {
  public readonly name;

  public readonly description;

  constructor(message: string, description: string = "") {
    super(message);

    this.name = "HTTP SERVER ERROR";

    this.description = description;

    Error.captureStackTrace(this);
  }
}

export default HttpServerError;
