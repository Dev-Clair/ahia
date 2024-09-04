import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

abstract class BaseError extends Error {
  public readonly name: string | HttpStatus;
  public readonly code: number | HttpCode;
  public readonly isOperational: boolean;

  constructor(
    name: string | HttpStatus,
    code: number | HttpCode,
    isOperational: boolean,
    message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }
}

export default BaseError;
