import APIError from "./apiError";
import HttpStatusCode from "../enum/httpStatusCode";

class ForbiddenError extends APIError {
  constructor(httpStatusCode: number | HttpStatusCode, message: string) {
    super("FORBIDDEN", httpStatusCode, true, message);
  }
}

export default ForbiddenError;
