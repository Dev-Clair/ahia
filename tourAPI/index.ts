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

sentry(Config.SENTRY_DSN, Config.NODE_ENV);

process.on("unhandledRejection", (reason, promise) => {
  Sentry.captureException(reason);

  Logger.error("Unhandled Rejection at:", promise, "reason:", reason);

  process.exitCode = 1;
});

process.on("uncaughtException", (error) => {
  Sentry.captureException(error);

  Logger.error("Uncaught Exception thrown:", error);

  process.exitCode = 1;
});

const server = new HttpServer(
  App,
  SSL(Config.SSL.KEY_FILE_PATH, Config.SSL.CERT_FILE_PATH)
);

try {
  Config.NODE_ENV === "test"
    ? server.startHTTP(Config.PORT.HTTP)
    : server.startHTTPS(Config.PORT.HTTPS);

  DbService.Make(Config.MONGO_URI).getConnection();
} catch (err: any) {
  if (err instanceof DbServiceError)
    Sentry.withScope((scope) => {
      scope.setTag("Database Error", "Critical");

      scope.setContext("details", {
        name: err.name,
        message: err.message,
        description: err.description,
        stack: err.stack,
      });

      Sentry.captureException(err);
    });
}

const shutdown = () => {
  Logger.info("Shutting down gracefully...");

  mongoose.connection.close(true);

  server.closeAllConnections();

  Sentry.close();
};

mongoose.connection.on("connecting", () => {
  Logger.info(`Attempting connection to database`);
});

mongoose.connection.on("connected", () => {
  Logger.info(`Database connection successful`);
});

mongoose.connection.on("disconnected", () => {
  Logger.info(`Database connection failure`);
});

mongoose.connection.on("reconnected", () => {
  Logger.info(`Database reconnection successful`);
});

process.on("SIGINT", () => shutdown());

process.on("SIGTERM", () => shutdown());
