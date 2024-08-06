import { MongooseError } from "mongoose";
import APIError from "../error/apiError";
import Config from "../../config";
import Logger from "../service/loggerService";
import Mail from "../utils/mail";

class GlobalErrorHandlingMiddleware {
  public static async handleError(err: Error): Promise<void> {
    Logger.error(
      `name: ${err.name}\nmessage: ${err.message}\nstack: ${err.stack}`
    );

    const sender: string = Config.LISTING.ADMIN_EMAIL_I;

    const recipient: [string] = [Config.LISTING.ADMIN_EMAIL_II];

    await Mail(
      sender,
      recipient,
      err.name,
      JSON.stringify({ message: err.message, stack: err.stack })
    );
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
