import APIError from "./apiError";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

class ConflictError extends APIError {
  constructor(message: string) {
    super(HttpStatus.CONFLICT, HttpCode.CONFLICT, true, message);
  }
}

export default ConflictError;
