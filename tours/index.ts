import cluster from "cluster";
import os from "os";
import App from "./app";
import Cron from "./cron/cron";
import Config from "./config";
import Connection from "./connection";
import logger from "./api/service/loggerService";

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  logger.info(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    logger.info(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  Connection(Config.MONGO_URI);

  const server = App.listen(Config.SERVER_PORT, () => {
    logger.info(
      `Worker ${process.pid} started, listening on port ${Config.SERVER_PORT}`
    );
  });

  // Cron.start();

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exitCode = 1;
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception thrown:", error);
    process.exitCode = 1;
  });

  const shutdown = () => {
    logger.info("Shutting down gracefully...");
    server.close(() => {
      logger.info("Closed out remaining connections");
      process.exitCode = 1;
    });

    setTimeout(() => {
      logger.info("Forcing server shutdown");
      process.exitCode = 1;
    }, 10000);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
