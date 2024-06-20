import HttpStatusCode from "../enum/HttpStatusCode";
import APIError from "./apiError";

class BadRequestError extends APIError {
  constructor(message: string) {
    super("BAD REQUEST", HttpStatusCode.BAD_REQUEST, true, message);
  }
}

export default BadRequestError;
