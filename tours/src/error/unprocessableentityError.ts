import HttpStatusCode from "../enum/HttpStatusCode";
import APIError from "./apiError";

class UnprocessableEntityError extends APIError {
  constructor(message: string) {
    super(
      "UNPROCESSABLE ENTITY",
      HttpStatusCode.UNPROCESSABLE_ENTITY,
      true,
      message
    );
  }
}

export default UnprocessableEntityError;
