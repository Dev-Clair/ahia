import APIError from "./apiError";
import HttpStatusCode from "../enum/httpStatusCode";

class InternalServerError extends APIError {
  constructor(
    httpStatusCode: number | HttpStatusCode,
    isOperational: boolean,
    message: string
  ) {
    super("INTERNAL SERVER ERROR", httpStatusCode, isOperational, message);
  }
}

export default InternalServerError;
