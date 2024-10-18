import AppError from "./appError";
import HttpCode from "../enum/httpCode";

class ConnectionServiceError extends AppError {
  constructor(
    name: string = "CONNECTION SERVICE ERROR: DATABASE",
    message: string
  ) {
    super(name, HttpCode.SERVICE_UNAVAILABLE, true, message);
  }
}

export default ConnectionServiceError;
