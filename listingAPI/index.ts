import sentry from "./sentry";
import * as Sentry from "@sentry/node";
import process from "node:process";
import mongoose from "mongoose";
import App from "./app";
import Config from "./config";
import DbConnectionService from "./src/service/dbConnectionService";
import DbConnectionServiceError from "./src/error/dbconnectionserviceError";
import HttpServer from "./src/utils/httpServer";
import Logger from "./src/service/loggerService";
import SSL from "./ssl/ssl";

sentry(Config.SENTRY_DSN, Config.NODE_ENV);

const server = new HttpServer(
  App,
  SSL(Config.SSL.KEY_FILE_PATH, Config.SSL.CERT_FILE_PATH)
);

try {
  if (Config.NODE_ENV === "test") {
    server.startHTTP(Config.PORT.HTTP);
  } else {
    server.startHTTPS(Config.PORT.HTTPS);
  }

  DbConnectionService(Config.MONGO_URI);
} catch (err: any) {
  if (err instanceof DbConnectionServiceError)
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

process.on("SIGINT", () => {
  shutdown();
});

process.on("SIGTERM", () => {
  shutdown();
});

mongoose.connection.on("connecting", () => {
  console.log(`Attempting connection to database`);
});

mongoose.connection.on("connected", () => {
  console.log(`Database connection successful`);
});

mongoose.connection.on("disconnected", () => {
  console.error(`Database connection failure`);
});

mongoose.connection.on("reconnected", () => {
  console.log(`Database reconnection successful`);
});
