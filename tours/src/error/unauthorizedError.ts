import HttpStatusCode from "../enum/HttpStatusCode";
import APIError from "./apiError";

class UnauthorisedError extends APIError {
  constructor(message: string) {
    super("UNAUTHORISED", HttpStatusCode.UNAUTHORISED, true, message);
  }
}

export default UnauthorisedError;
