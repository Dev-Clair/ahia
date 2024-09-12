import * as Sentry from "@sentry/node";
import { MongooseError } from "mongoose";
import APIError from "../error/apiError";
import Logger from "../utils/logger";

class GlobalErrorHandlingMiddleware {
  public static async handleError(err: Error): Promise<void> {
    Logger.error(
      `name: ${err.name}\nmessage: ${err.message}\nstack: ${err.stack}`
    );

    Sentry.withScope((scope) => {
      scope.setTag("Error", "Listing API");

      scope.setContext("API", {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });

      Sentry.captureException(err);

      process.exitCode = 1;
    });
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
