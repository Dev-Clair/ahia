import APIError from "./apiError";
import HttpCode from "../enum/httpCode";

class BadRequestError extends APIError {
  constructor(httpCode: number | HttpCode, message: string) {
    super("BAD REQUEST", httpCode, true, message);
  }
}

export default BadRequestError;
