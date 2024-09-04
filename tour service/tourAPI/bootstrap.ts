import * as Sentry from "@sentry/node";
import process from "node:process";
import mongoose from "mongoose";
import Config from "./config";
import DatabaseService from "./src/service/databaseService";
import DatabaseServiceError from "./src/error/databaseserviceError";
import HttpServer from "./src/utils/httpServer";
import HttpServerError from "./src/error/httpserverError";
import Logger from "./src/service/loggerService";

/**
 * Bootstraps the entire application
 * @returns Promise<void>
 */
export async function Boot(Server: HttpServer): Promise<void> {
  try {
    // Start and initialize server on http(s) port
    await Server.Init(Config.PORT)
      .then(() => Logger.info(`Listening on http port ${Config.PORT}`))
      .catch((reason: any) => {
        throw new HttpServerError(reason, "HTTP Server Initialization Error");
      });

    // Create and initialize database with connection string
    await DatabaseService.Create(Config.MONGO_URI).getConnection();
  } catch (err: any) {
    if (err instanceof HttpServerError) ServerErrorHandler(err, Server);

    if (err instanceof DatabaseServiceError) DatabaseErrorHandler(err, Server);
  }
}

/**
 * Global process events listeners/handlers
 * @returns void
 */
export function GlobalProcessEventsListener(): void {
  process
    .on("unhandledRejection", UnhandledRejectionsHandler)
    .on("uncaughtException", UnCaughtExceptionsHandler)
    .on("SIGINT", ShutdownHandler)
    .on("SIGHUP", ShutdownHandler)
    .on("SIGTERM", ShutdownHandler);
}

/**
 * Database connection event listeners
 * @returns void
 */
export function DatabaseEventsListener(): void {
  mongoose.connection
    .on("connecting", () => Logger.info(`Attempting connection to database`))
    .on("connected", () => Logger.info(`Database connection successful`))
    .on("disconnected", () => Logger.info(`Database connection failure`))
    .on("reconnected", () => Logger.info(`Database reconnection successful`));
}

/**
 * Handles server error
 * @param err
 * @param Server
 * @returns void
 */
export function ServerErrorHandler(
  err: HttpServerError,
  Server: HttpServer
): void {
  const error = {
    name: err.name,
    message: err.message,
    description: err.description,
    stack: err.stack,
  };

  if (err instanceof HttpServerError)
    Sentry.withScope((scope) => {
      scope.setTag("Server Initialization Error", "Fatal");

      scope.setContext("Error", error);

      Sentry.captureException(err);
    });

  Logger.error(error);

  Sentry.captureException(err);

  ShutdownHandler(Server);
}

/**
 * Handles database error
 * @param err
 * @param Server
 * @returns void
 */
export function DatabaseErrorHandler(
  err: DatabaseServiceError,
  Server: HttpServer
): void {
  const error = {
    name: err.name,
    message: err.message,
    description: err.description,
    stack: err.stack,
  };

  if (err instanceof DatabaseServiceError)
    Sentry.withScope((scope) => {
      scope.setTag("Database Connection Error", "Critical");

      scope.setContext("Error", error);

      Sentry.captureException(err);
    });

  Logger.error(error);

  Sentry.captureException(err);

  ShutdownHandler(Server);
}

/**
 * Handles unhandled rejections
 * @param reason
 * @param promise
 * @returns void
 */
export function UnhandledRejectionsHandler(
  reason: unknown,
  promise: Promise<any>
): void {
  Sentry.captureException(reason);

  Logger.error("Unhandled Rejection at:", promise, "reason:", reason);

  process.exitCode = 1;
}

/**
 * Handles uncaught exceptions
 * @param error
 * @returns void
 */
export function UnCaughtExceptionsHandler(error: any): void {
  Sentry.captureException(error);

  Logger.error("Uncaught Exception thrown:", error);

  process.exitCode = 1;
}

/**
 * Handles graceful shutdown
 * @param server
 * @returns void
 */
export async function ShutdownHandler(Server?: HttpServer): Promise<void> {
  Logger.info("Shutting down gracefully...");

  await mongoose.connection.close(true);

  await Server?.Close();

  await Sentry.close();

  process.exitCode = 1;
}
