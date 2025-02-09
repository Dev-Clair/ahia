import APIError from "./apiError";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

class UnauthorizedError extends APIError {
  constructor(message: string) {
    super(HttpStatus.UNAUTHORIZED, HttpCode.UNAUTHORIZED, true, message);
  }
}

export default UnauthorizedError;
