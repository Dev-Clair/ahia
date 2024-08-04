import APIError from "./apiError";
import HttpStatusCode from "../enum/httpStatusCode";

class BadRequestError extends APIError {
  constructor(httpStatusCode: number | HttpStatusCode, message: string) {
    super("BAD REQUEST", httpStatusCode, true, message);
  }
}

export default BadRequestError;
