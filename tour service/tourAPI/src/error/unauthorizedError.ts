import APIError from "./apiError";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

class UnauthorisedError extends APIError {
  constructor(message: string) {
    super(HttpStatus.UNAUTHORISED, HttpCode.UNAUTHORISED, true, message);
  }
}

export default UnauthorisedError;
