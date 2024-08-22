import APIError from "./apiError";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

class InternalServerError extends APIError {
  constructor(isOperational: boolean, message: string) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      HttpCode.INTERNAL_SERVER_ERROR,
      isOperational,
      message
    );
  }
}

export default InternalServerError;
