import HttpStatusCode from "../enum/HttpStatusCode";
import APIError from "./apiError";

class ForbiddenError extends APIError {
  constructor(message: string) {
    super("FORBIDDEN", HttpStatusCode.FORBIDDEN, true, message);
  }
}

export default ForbiddenError;
