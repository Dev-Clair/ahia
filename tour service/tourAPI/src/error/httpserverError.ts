import AppError from "./appError";
import HttpCode from "../enum/httpCode";

class HttpServerError extends AppError {
  constructor(name: string = "HTTP SERVER ERROR", message: string) {
    super(name, HttpCode.SERVICE_UNAVAILABLE, true, message);
  }
}

export default HttpServerError;
