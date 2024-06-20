import HttpStatusCode from "../enum/httpStatusCode";
import APIError from "./apiError";

class UnprocessableEntityError extends APIError {
  constructor(httpStatusCode: number | HttpStatusCode, message: string) {
    super("UNPROCESSABLE ENTITY", httpStatusCode, true, message);
  }
}

export default UnprocessableEntityError;
