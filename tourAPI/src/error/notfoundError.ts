import APIError from "./apiError";
import HttpStatusCode from "../enum/httpStatusCode";

class NotFoundError extends APIError {
  constructor(httpStatusCode: number | HttpStatusCode, message: string) {
    super("NOT FOUND", httpStatusCode, true, message);
  }
}

export default NotFoundError;
