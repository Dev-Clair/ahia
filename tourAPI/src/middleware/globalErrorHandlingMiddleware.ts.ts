import { MongooseError } from "mongoose";
import APIError from "../error/apiError";
import Logger from "../service/loggerService";
import NotifyUser from "../utils/notificationHandler/notificationHandler";

class GlobalErrorHandlingMiddleware {
  public async handleError(err: Error): Promise<void> {
    Logger.error(`name: ${err.name}\n message: ${err.message}`);

    // await NotifyUser();
  }

  public isSyntaxError(err: Error): Boolean {
    if (err instanceof SyntaxError) {
      return true;
    }

    return false;
  }

  public isSafeError(err: Error): Boolean {
    if (err instanceof MongooseError) {
      if (err.name === "ValidationError" || "CastError") {
        return true;
      }
    }

    return false;
  }

  public isTrustedError(err: Error): Boolean {
    if (err instanceof APIError) {
      return err.isOperational;
    }

    return false;
  }
}

const GlobalErrorHandler = new GlobalErrorHandlingMiddleware();

export default GlobalErrorHandler;
