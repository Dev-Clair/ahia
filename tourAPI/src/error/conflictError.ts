import APIError from "./apiError";
import HttpStatusCode from "../enum/httpStatusCode";

class ConflictError extends APIError {
  constructor(httpStatusCode: number | HttpStatusCode, message: string) {
    super("CONFLICT", httpStatusCode, true, message);
  }
}

export default ConflictError;
