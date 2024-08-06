import APIError from "./apiError";
import HttpStatusCode from "../enum/httpStatusCode";

class ForbiddenError extends APIError {
  public path: string;

  constructor(
    httpStatusCode: number | HttpStatusCode,
    message: string,
    isOperational: boolean,
    path: string
  ) {
    super("FORBIDDEN", httpStatusCode, isOperational, message);

    this.path = path;
  }
}

export default ForbiddenError;
