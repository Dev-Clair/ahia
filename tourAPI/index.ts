import mongoose from "mongoose";
import App from "./app";
import Config from "./config";
import Connection from "./connection";
import ConnectionError from "./src/error/connectionError";
import Logger from "./src/service/loggerService";
import Mail from "./src/utils/mail";
import MailerError from "./src/error/mailerError";
import HttpServer from "./httpServer";
import SSL from "./ssl/ssl";

const sender: string = Config.TOUR.ADMIN_EMAIL_I;

const recipient: [string] = [Config.TOUR.ADMIN_EMAIL_II];

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

  Connection(Config.MONGO_URI);
} catch (err: any) {
  if (err instanceof ConnectionError) {
    const text = JSON.stringify({
      message: err.message,
      description: err.description,
    });

    Mail(sender, recipient, err.name, text);

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
