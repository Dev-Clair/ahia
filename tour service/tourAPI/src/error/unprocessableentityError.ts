import APIError from "./apiError";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

class UnprocessableEntityError extends APIError {
  constructor(message: string) {
    super(
      HttpStatus.UNPROCESSABLE_ENTITY,
      HttpCode.UNPROCESSABLE_ENTITY,
      true,
      message
    );
  }
}

export default UnprocessableEntityError;
