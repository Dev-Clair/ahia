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

  public isTrustedError(err: Error): boolean {
    return err instanceof APIError && err.isOperational;
  }

  public isSafeError(err: Error): boolean {
    return err instanceof MongooseError;
  }

  public isSyntaxError(err: Error): boolean {
    return err instanceof SyntaxError && err.message.includes("JSON");
  }
}

const GlobalErrorHandler = new GlobalErrorHandlingMiddleware();

export default GlobalErrorHandler;
