import APIError from "./apiError";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

class ForbiddenError extends APIError {
  constructor(message: string) {
    super(HttpStatus.FORBIDDEN, HttpCode.FORBIDDEN, true, message);
  }
}

export default ForbiddenError;
