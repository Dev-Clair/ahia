import * as Sentry from "@sentry/node";
import { MongooseError } from "mongoose";
import APIError from "../error/apiError";
import Log from "../utils/logger";

class GlobalErrorHandlingMiddleware {
  /**
   * Handles non-operational errors gracefully
   * @param error error object
   */
  public static async handleError(error: Error): Promise<void> {
    Log.App.error(
      `name: ${error.name}\nmessage: ${error.message}\nstack: ${error.stack}`
    );

    Sentry.captureException(error);

    process.exitCode = 1;
  }

  /**
   * Verifies if error is a trusted operational error
   * @param error error object
   */
  public static isTrustedError(error: APIError | Error): boolean {
    return error instanceof APIError && error.isOperational;
  }

  /**
   * Verifies if error is a safe operational error
   * @param error error object
   */
  public static isSafeError(error: Error): boolean {
    return error instanceof MongooseError;
  }

  /**
   * Verifies if error is a syntax operational error
   * @param error error object
   */
  public static isSyntaxError(error: Error): boolean {
    return error instanceof SyntaxError && error.message.includes("JSON");
  }
}

const GlobalErrorHandler = GlobalErrorHandlingMiddleware;

export default GlobalErrorHandler;
