import * as Sentry from "@sentry/node";
import { MongooseError } from "mongoose";
import APIError from "../error/apiError";
import Logger from "../utils/logger";

class GlobalErrorHandlingMiddleware {
  /**
   * Handles non-operational errors gracefully
   * @param err error object
   */
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
    });

    process.exitCode = 1;
  }

  /**
   * Verifies if error is a trusted operational error
   * @param err error object
   */
  public static isTrustedError(err: APIError | Error): boolean {
    return err instanceof APIError && err.isOperational;
  }

  /**
   * Verifies if error is a safe operational error
   * @param err error object
   */
  public static isSafeError(err: Error): boolean {
    return err instanceof MongooseError;
  }

  /**
   * VErifies if error is a syntax operational error
   * @param err error object
   */
  public static isSyntaxError(err: Error): boolean {
    return err instanceof SyntaxError && err.message.includes("JSON");
  }
}

const GlobalErrorHandler = GlobalErrorHandlingMiddleware;

export default GlobalErrorHandler;
