import APIError from "./apiError";
import HttpStatusCode from "../enum/httpStatusCode";

class UnprocessableEntityError extends APIError {
  constructor(httpStatusCode: number | HttpStatusCode, message: string) {
    super("UNPROCESSABLE ENTITY", httpStatusCode, true, message);
  }
}

export default UnprocessableEntityError;
