import BaseError from "./baseError";
import HttpStatusCode from "../enum/httpStatusCode";

class APIError extends BaseError {
  constructor(
    name: string,
    httpStatusCode: number | HttpStatusCode,
    isOperational: boolean,
    message: string
  ) {
    super(name, httpStatusCode, isOperational, message);
  }
}

export default APIError;
