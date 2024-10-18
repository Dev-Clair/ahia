import AppError from "./appError";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

class APIError extends AppError {
  constructor(
    name: string | HttpStatus,
    code: number | HttpCode,
    isOperational: boolean,
    message: string
  ) {
    super(name, code, isOperational, message);
  }
}

export default APIError;
