import APIError from "./apiError";
import HttpStatusCode from "../enum/httpStatusCode";

class UnauthorisedError extends APIError {
  public path: string;

  constructor(
    httpStatusCode: number | HttpStatusCode,
    message: string,
    isOperational: boolean,
    path: string
  ) {
    super("UNAUTHORISED", httpStatusCode, isOperational, message);

    this.path = path;
  }
}

export default UnauthorisedError;
