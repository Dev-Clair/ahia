import APIError from "./apiError";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

class BadRequestError extends APIError {
  constructor(message: string) {
    super(HttpStatus.BAD_REQUEST, HttpCode.BAD_REQUEST, true, message);
  }
}

export default BadRequestError;
