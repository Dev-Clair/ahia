import http from "./http";
import mongoose from "mongoose";
import App from "./app";
import Config from "./config";
import Connection from "./connection";
import Logger from "./src/service/loggerService";
import Notify from "./src/utils/notify";

const HTTP = http.HTTP(App);

// const HTTPS = http.HTTPS(App);

try {
  if (Config.NODE_ENV === "development") {
    HTTP.listen(Config.HTTP_PORT, () => {
      Logger.info(`Listening on port ${Config.HTTP_PORT}`);
    });
  }

  // if (Config.NODE_ENV === "production") {
  //   HTTPS.listen(Config.HTTPS_PORT, () => {
  //     console.log(`Listening on port ${Config.HTTPS_PORT}`);
  //   });
  // }

  Connection(Config.MONGO_URI);

  const shutdown = () => {
    Logger.info("Shutting down gracefully...");

    // Close open database connections
    mongoose.connection.close(true);

    // Close running server process
    if (Config.NODE_ENV === "development") {
      Logger.info(
        `Closing all connections to server on port ${Config.HTTP_PORT}`
      );

      HTTP.closeAllConnections();
    }

    // if (Config.NODE_ENV === "production") {
    //   Logger.info(
    //     `Closing all connections to server on port ${Config.HTTPS_PORT}`
    //   );

    //   HTTPS.closeAllConnections();
    // }
  };

  process.on("uncaughtException", (error) => {
    Logger.error("Uncaught Exception thrown:", error);
    process.exitCode = 1;
  });

  process.on("unhandledRejection", (reason, promise) => {
    Logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exitCode = 1;
  });

  process.on("SIGINT", () => {
    shutdown();
  });

  process.on("SIGTERM", () => {
    shutdown();
  });
} catch (err: any) {
  if (err instanceof ConnectionError) {
    const sender: string = Config.TOUR_ADMIN_EMAIL_I;

    const recipient: [string] = [Config.TOUR_ADMIN_EMAIL_II];

    const text = JSON.stringify({
      message: err.message,
      description: err.description,
    });

    Notify(sender, recipient, err.name, text);

    process.exitCode = 1;
  }
}
