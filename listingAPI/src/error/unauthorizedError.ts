import APIError from "./apiError";
import HttpStatusCode from "../enum/httpStatusCode";

class UnauthorisedError extends APIError {
  constructor(httpStatusCode: number | HttpStatusCode, message: string) {
    super("UNAUTHORISED", httpStatusCode, true, message);
  }
}

export default UnauthorisedError;
