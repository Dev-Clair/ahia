import HttpStatusCode from "../enum/HttpStatusCode";
import APIError from "./apiError";

class InternalServerError extends APIError {
  constructor(
    message = "Oops! Sorry an error occured on our end, we cannot process your request at this time. Please try again shortly."
  ) {
    super(
      "INTERNAL SERVER ERROR",
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      true,
      message
    );
  }
}

export default InternalServerError;
