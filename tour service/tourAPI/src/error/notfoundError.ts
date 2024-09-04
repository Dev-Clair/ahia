import APIError from "./apiError";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

class NotFoundError extends APIError {
  constructor(message: string) {
    super(HttpStatus.NOT_FOUND, HttpCode.NOT_FOUND, true, message);
  }
}

export default NotFoundError;
