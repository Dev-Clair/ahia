import http from "./http";
import mongoose from "mongoose";
import App from "./app";
import Cron from "./cron";
import Config from "./config";
import Connection from "./connection";
import Logger from "./src/service/loggerService";

const HTTP = http.HTTP(App);

// const HTTPS = http.HTTPS(App);

HTTP.listen(Config.HTTP_PORT, () => {
  console.log(`Listening on port ${Config.HTTP_PORT}`);
});

// HTTPS.listen(Config.HTTPS_PORT, () => {
//   console.log(`Listening on port ${Config.HTTPS_PORT}`);
// });

Connection(Config.MONGO_URI);

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
  console.log("Shutting down gracefully...");

  // Stop running cron tasks
  Cron.stop();

  // Close open mongoose connections
  mongoose.connection.close(true);

  // Close running server process
  HTTP.closeAllConnections();

  // HTTPS.closeAllConnections();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
