import mongoose from "mongoose";
import App from "./app";
import Config from "./config";
import Connection from "./connection";
import ConnectionError from "./src/error/connectionError";
import Logger from "./src/service/loggerService";
import MailerError from "./src/error/mailerError";
import Notify from "./src/utils/notify";
import Server from "./server";
import SSL from "./ssl/ssl";

const sender: string = Config.TOUR_ADMIN_EMAIL_I;

const recipient: [string] = [Config.TOUR_ADMIN_EMAIL_II];

const server = new Server(
  App,
  SSL(Config.SSL_KEY_FILE_PATH, Config.SSL_CERT_FILE_PATH)
);

try {
  if (Config.NODE_ENV === "development") {
    server.startHTTPServer(Config.HTTP_PORT);
  }

  if (Config.NODE_ENV === "production") {
    server.startHTTPSServer(Config.HTTPS_PORT);
  }

  Connection(Config.MONGO_URI);
} catch (err: any) {
  if (err instanceof ConnectionError) {
    const text = JSON.stringify({
      message: err.message,
      description: err.description,
    });

    Notify(sender, recipient, err.name, text);

    // process.exitCode = 1;

    process.kill(process.pid, "SIGTERM");
  }

  if (err instanceof MailerError) {
    console.error(err);

    process.kill(process.pid, "SIGTERM");
  }
}

const shutdown = () => {
  Logger.info("Shutting down gracefully...");

  // Close open database connections
  mongoose.connection.close(true);

  // Close running server process
  server.closeAllConnections();
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
