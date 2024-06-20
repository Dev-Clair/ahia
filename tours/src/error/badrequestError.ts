import HttpStatusCode from "../enum/httpStatusCode";
import APIError from "./apiError";

class BadRequestError extends APIError {
  constructor(httpStatusCode: number | HttpStatusCode, message: string) {
    super("BAD REQUEST", httpStatusCode, true, message);
  }
}

export default BadRequestError;
