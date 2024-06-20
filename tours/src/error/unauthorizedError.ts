import HttpStatusCode from "../enum/httpStatusCode";
import APIError from "./apiError";

class UnauthorisedError extends APIError {
  constructor(httpStatusCode: number | HttpStatusCode, message: string) {
    super("UNAUTHORISED", httpStatusCode, true, message);
  }
}

export default UnauthorisedError;
