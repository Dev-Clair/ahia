import AppError from "./appError";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

class ConnectionServiceError extends AppError {
  constructor(name: string, message: string) {
    super(
      (name = HttpStatus.SERVICE_UNAVAILABLE),
      HttpCode.SERVICE_UNAVAILABLE,
      true,
      message
    );
  }
}

export default ConnectionServiceError;
