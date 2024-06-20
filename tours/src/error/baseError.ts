import HttpStatusCode from "../enum/HttpStatusCode";

abstract class BaseError extends Error {
  public readonly name: string;
  public readonly errorCode: number | HttpStatusCode;
  public readonly isOperational: Boolean;

  constructor(
    name: string,
    errorCode: number | HttpStatusCode,
    isOperational: Boolean,
    message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }
}

export default BaseError;
