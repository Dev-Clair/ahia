import HttpStatusCode from "../enum/httpStatusCode";
import APIError from "./apiError";

class ForbiddenError extends APIError {
  constructor(httpStatusCode: number | HttpStatusCode, message: string) {
    super("FORBIDDEN", httpStatusCode, true, message);
  }
}

export default ForbiddenError;
