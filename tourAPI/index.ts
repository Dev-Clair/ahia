import mongoose from "mongoose";
import App from "./app";
import Cron from "./cron";
import Config from "./config";
import Connection from "./connection";
import Logger from "./src/service/loggerService";

Connection(Config.MONGO_URI);

const Server = App.listen(Config.SERVER_PORT, () =>
  Logger.info(`server up and listening on port ${Config.SERVER_PORT}`)
);

Cron.start();

process.on("uncaughtException", (error) => {
  Logger.error("Uncaught Exception thrown:", error);
  process.exitCode = 1;
});

process.on("unhandledRejection", (reason, promise) => {
  Logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exitCode = 1;
});

const shutdown = () => {
  Logger.info("Shutting down gracefully...");

  // Stop running cron tasks
  Cron.stop();

  // Close open mongoose connections
  mongoose.connection.close(true);

  // Close running server process
  Server.close(() => {
    Logger.info("Closed out remaining connections, initiating shutdown...");
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
