import * as Sentry from "@sentry/node";
import process from "node:process";
import mongoose from "mongoose";
import Config from "./config";
import Connection from "./src/utils/connection";
import ConnectionError from "./src/error/connectionError";
import HttpServer from "./src/utils/httpServer";
import HttpServerError from "./src/error/httpserverError";
import Log from "./src/utils/logger";

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
      .then(() => Log.App.info(`Listening on http port ${Config.PORT}`))
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
    .on("connecting", () => Log.App.info(`Attempting connection to database`))
    .on("connected", () => Log.App.info(`Database connection successful`))
    .on("disconnected", () => Log.App.info(`Database connection failure`))
    .on("reconnected", () => Log.App.info(`Database reconnection successful`));
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
      scope.setTag("Http Server", "Fatal");

      scope.setContext("Initialization Error", error);

      Sentry.captureException(err);
    });

  Log.App.error(error);

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
      scope.setTag("Database", "Critical");

      scope.setContext("Connection Error", error);

      Sentry.captureException(err);
    });

  Log.App.error(error);

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

  Log.App.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);

  process.exitCode = 1;
}

/**
 * Handles uncaught exceptions
 * @param error error object
 */
export function UnCaughtExceptionsHandler(error: any): void {
  Sentry.captureException(error);

  Log.App.error(`Uncaught Exception thrown: ${error}`);

  process.exitCode = 1;
}

/**
 * Handles graceful shutdown
<<<<<<< HEAD
 * @param server
 * @returns void
=======
 * @param server http server instance
>>>>>>> listing_service
 */
export async function ShutdownHandler(
  Server: HttpServer | null = null
): Promise<void> {
  Log.App.info("Shutting down gracefully...");

  await mongoose.connection.close(true);

  await Server?.Close();

  await Sentry.close();

  process.exitCode = 1;
}
