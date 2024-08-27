import * as Sentry from "@sentry/node";
import process from "node:process";
import mongoose from "mongoose";
import App from "./app";
import Config from "./config";
import DatabaseService from "./src/service/databaseService";
import DatabaseServiceError from "./src/error/databaseserviceError";
import HttpServer from "./src/utils/httpServer";
import Logger from "./src/service/loggerService";
import SSL from "./ssl/ssl";

/**
 * Boostraps the entire application
 */
export async function Bootstrap() {
  // Start and initialize server on http port
  const Server = await HttpServer.Create(
    App,
    SSL(Config.SSL.KEY_FILE_PATH, Config.SSL.CERT_FILE_PATH)
  );

  if (Config.NODE_ENV !== "production") {
    await Server.StartHTTP(Config.PORT.HTTP);
  } else {
    await Server.StartHTTPS(Config.PORT.HTTPS);
  }

  // Create and initialize database with connection string
  await DatabaseService.Create(Config.MONGO_URI)
    .getConnection()
    .catch((err: any) => DatabaseErrorHandler(err));
}

/**
 * Global process events listeners/handlers
 * @returns void
 */
export function GlobalProcessEventsHandler(): void {
  process
    .on("unhandledRejection", UnhandledRejectionsHandler)
    .on("uncaughtException", UnCaughtExceptionsHandler)
    .on("SIGINT", RestartHandler)
    .on("SIGUP", ShutdownHandler)
    .on("SIGTERM", RestartHandler);
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
 * Handles database error
 * @param err
 * @returns void
 */
export function DatabaseErrorHandler(err: DatabaseServiceError): void {
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

  Logger.error(JSON.stringify(error));

  process.exitCode = 1;

  process.kill(process.pid, "SIGUP");
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

  process.kill(process.pid, "SIGTERM");
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

  process.kill(process.pid, "SIGTERM");
}

/**
 * Handles graceful shutdown
 * @param server
 * @returns void
 */
export function ShutdownHandler(server: HttpServer): void {
  Logger.info("Shutting down gracefully...");

  mongoose.connection.close(true);

  server.Close();

  Sentry.close();

  process.exitCode = 1;

  process.kill(process.pid, "SIGTERM");
}

/**
 * Handles restart after graceful shutdown
 * @returns void
 */
export function RestartHandler(): void {}
