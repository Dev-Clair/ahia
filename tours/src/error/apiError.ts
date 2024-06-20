import HttpStatusCode from "../enum/HttpStatusCode";
import BaseError from "./baseError";

class APIError extends BaseError {
  constructor(
    name: string,
    httpStatusCode: HttpStatusCode,
    isOperational: Boolean,
    message: string
  ) {
    super(name, httpStatusCode, isOperational, message);
  }
}

export default APIError;
