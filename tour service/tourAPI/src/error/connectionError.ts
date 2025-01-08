import AppError from "./appError";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

class ConnectionError extends AppError {
  constructor(name: string, message: string) {
    super(
      (name = HttpStatus.SERVICE_UNAVAILABLE),
      HttpCode.SERVICE_UNAVAILABLE,
      true,
      message
    );
  }
}

export default ConnectionError;
