import HttpStatusCode from "../enum/HttpStatusCode";

abstract class APIError extends Error {
  public readonly name: string;
  public readonly httpStatusCode: number | HttpStatusCode;
  public readonly isOperational: Boolean;

  constructor(
    name: string,
    httpStatusCode: number | HttpStatusCode,
    isOperational: Boolean,
    message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.httpStatusCode = httpStatusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }
}

export default APIError;
