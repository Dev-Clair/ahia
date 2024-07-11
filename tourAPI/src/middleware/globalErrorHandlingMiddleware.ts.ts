import { MongooseError } from "mongoose";
import APIError from "../error/apiError";
import Logger from "../service/loggerService";
import Notify from "../utils/notify";

class GlobalErrorHandlingMiddleware {
  public static async handleError(err: Error): Promise<void> {
    Logger.error(
      `name: ${err.name}\nmessage: ${err.message}\nstack: ${err.stack}`
    );

    // await Notify();
  }

  public static isTrustedError(err: APIError | Error): boolean {
    return err instanceof APIError && err.isOperational;
  }

  public static isSafeError(err: Error): boolean {
    return err instanceof MongooseError;
  }

  public static isSyntaxError(err: Error): boolean {
    return err instanceof SyntaxError && err.message.includes("JSON");
  }
}

const GlobalErrorHandler = GlobalErrorHandlingMiddleware;

export default GlobalErrorHandler;
