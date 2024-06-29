import { MongooseError } from "mongoose";
import APIError from "../error/apiError";
import Logger from "../service/loggerService";
import NotifyUser from "../utils/notificationHandler/notificationHandler";

class GlobalErrorHandlingMiddleware {
  public async handleError(err: Error): Promise<void> {
    console.log(err.name, err.message, err.stack);

    // Logger.error(`name: ${err.name}\n message: ${err.message}`);

    // await NotifyUser();
  }

  public isTrustedError(err: Error): Boolean {
    if (err instanceof APIError) {
      return err.isOperational;
    }

    return false;
  }

  public isSafeError(err: Error): Boolean {
    if (err instanceof MongooseError) {
      if (err.name === "ValidationError") {
        return true;
      } else if (err.name === "CastError") {
        return true;
      } else {
        return false;
      }
    }

    return false;
  }
}

const GlobalErrorHandler = new GlobalErrorHandlingMiddleware();

export default GlobalErrorHandler;
