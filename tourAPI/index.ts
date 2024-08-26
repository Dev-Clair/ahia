import sentry from "./sentry";
import * as Sentry from "@sentry/node";
import process from "node:process";
import mongoose from "mongoose";
import App from "./app";
import Config from "./config";
import DbService from "./src/service/dbService";
import DbServiceError from "./src/error/dbserviceError";
import HttpServer from "./src/utils/httpServer";
import Logger from "./src/service/loggerService";
import SSL from "./ssl/ssl";

/**
 *
 * Initialize Sentry
 *
 */
sentry(Config.TOUR.SERVICE.SENTRY_DSN, Config.NODE_ENV);

process
  .on("unhandledRejection", (reason, promise) => {
    Sentry.captureException(reason);

    Logger.error("Unhandled Rejection at:", promise, "reason:", reason);

    process.exitCode = 1;
  })
  .on("uncaughtException", (error) => {
    Sentry.captureException(error);

    Logger.error("Uncaught Exception thrown:", error);

    process.exitCode = 1;
  })
  .on("SIGINT", () => shutdown())
  .on("SIGUSR1", () => shutdown())
  .on("SIGUP", () => shutdown())
  .on("SIGTERM", () => shutdown());

mongoose.connection
  .on("connecting", () => Logger.info(`Attempting connection to database`))
  .on("connected", () => Logger.info(`Database connection successful`))
  .on("disconnected", () => Logger.info(`Database connection failure`))
  .on("reconnected", () => Logger.info(`Database reconnection successful`));

/**
 *
 * Bootstrap Application
 *
 */
const server = new HttpServer(
  App,
  SSL(Config.SSL.KEY_FILE_PATH, Config.SSL.CERT_FILE_PATH)
);

// Start Server
Config.NODE_ENV === "test"
  ? server.startHTTP(Config.PORT.HTTP)
  : server.startHTTPS(Config.PORT.HTTPS);

// Start Database
DbService.Make(Config.MONGO_URI)
  .getConnection()
  .catch((err) => {
    const errorPayload = {
      name: err.name,
      message: err.message,
      description: err.description,
      stack: err.stack,
    };

    if (err instanceof DbServiceError)
      Sentry.withScope((scope) => {
        scope.setTag("Database-Error", "Critical");

        scope.setContext("Error", errorPayload);

        Sentry.captureException(err);
      });

    Logger.error(JSON.stringify(errorPayload));
  });

/**
 *
 * Shutdown Application
 *
 */
const shutdown = () => {
  Logger.info("Shutting down gracefully...");

  mongoose.connection.close(true);

  server.closeAllConnections();

  Sentry.close();
};
