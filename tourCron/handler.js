const Config = require("./config");
const Connection = require("./connection");
const NotifyAdmin = require("./notificationHandler");
const TourNotification = require("./tourNotification");

Connection(Config.MONGO_URI);

exports.cron = async (event, context) => {
  try {
    await TourNotification();
  } catch (err) {
    const from = process.env.TOUR_ADMIN_EMAIL_I || "";

    const to = [process.env.TOUR_ADMIN_EMAIL_II];

    const subject = "Cron Scheduler Error";

    const message = `${err.message}`;

    await NotifyAdmin(from, to, subject, message);
  }
};

const shutdown = () => {
  console.log("Closing all open connections");

  mongoose.connection.close(true);

  process.exitCode = 1;
};

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error);
  shutdown();
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  shutdown();
});

process.on("SIGTERM", () => {
  shutdown();
});
