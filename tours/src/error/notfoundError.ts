import HttpStatusCode from "../enum/HttpStatusCode";
import APIError from "./apiError";

class NotFoundError extends APIError {
  constructor(message: string) {
    super("NOT FOUND", HttpStatusCode.NOT_FOUND, true, message);
  }
}

export default NotFoundError;
