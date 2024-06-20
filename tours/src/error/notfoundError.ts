import HttpStatusCode from "../enum/httpStatusCode";
import APIError from "./apiError";

class NotFoundError extends APIError {
  constructor(httpStatusCode: number | HttpStatusCode, message: string) {
    super("NOT FOUND", httpStatusCode, true, message);
  }
}

export default NotFoundError;
