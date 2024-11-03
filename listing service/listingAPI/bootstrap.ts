import * as Sentry from "@sentry/node";
import process from "node:process";
import mongoose from "mongoose";
import Config from "./config";
import Connection from "./src/utils/connection";
import ConnectionError from "./src/error/connectionError";
import HttpServer from "./src/utils/httpServer";
import HttpServerError from "./src/error/httpserverError";
import Logger from "./src/utils/logger";

/**
 * Bootstraps the entire application
 */
export async function Boot(
  Server: HttpServer,
  Database: Connection
): Promise<void> {
  try {
    // Initialize server on http(s) port
    await Server.Init(Config.PORT)
      .then(() => Logger.info(`Listening on http port ${Config.PORT}`))
      .catch((reason: any) => {
        throw new HttpServerError("HTTP Server Initialization Error", reason);
      });

    // Initialize database
    await Database.Init();
  } catch (err: any) {
    if (err instanceof HttpServerError) ServerErrorHandler(err, Server);

    if (err instanceof ConnectionError) DatabaseErrorHandler(err, Server);
  }
}

/**
 * Global process events listeners/handlers
 */
export function GlobalProcessEventsListener(): void {
  process
    .on("unhandledRejection", UnhandledRejectionsHandler)
    .on("uncaughtException", UnCaughtExceptionsHandler)
    .on("SIGHUP", ShutdownHandler)
    .on("SIGTERM", ShutdownHandler);
}

/**
 * Database connection event listeners
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
 * @param err error object
 * @param Server http server instance
 */
export function ServerErrorHandler(
  err: HttpServerError,
  Server: HttpServer
): void {
  const error = {
    name: err.name,
    message: err.message,
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
 * @param err error object
 * @param Server http server instance
 */
export function DatabaseErrorHandler(
  err: ConnectionError,
  Server: HttpServer
): void {
  const error = {
    name: err.name,
    message: err.message,
    stack: err.stack,
  };

  if (err instanceof ConnectionError)
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
 */
export function UnhandledRejectionsHandler(
  reason: unknown,
  promise: Promise<any>
): void {
  Sentry.captureException(reason);

  Logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);

  process.exitCode = 1;
}

/**
 * Handles uncaught exceptions
 * @param error error object
 */
export function UnCaughtExceptionsHandler(error: any): void {
  Sentry.captureException(error);

  Logger.error(`Uncaught Exception thrown: ${error}`);

  process.exitCode = 1;
}

/**
 * Handles graceful shutdown
 * @param server http server instance
 */
export async function ShutdownHandler(
  Server: HttpServer | null = null
): Promise<void> {
  Logger.info("Shutting down gracefully...");

  await mongoose.connection.close(true);

  await Server?.Close();

  await Sentry.close();

  process.exitCode = 1;
}
