import BaseError from "./baseError";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

class APIError extends BaseError {
  constructor(
    name: string | HttpStatus,
    code: number | HttpCode,
    isOperational: boolean,
    message: string
  ) {
    super(name, code, isOperational, message);
  }
}

export default APIError;
