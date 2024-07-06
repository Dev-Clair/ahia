const Config = require("./config");
const Connection = require("./connection");
const Notify = require("./notify");
const TourNotification = require("./tourNotification");

Connection(Config.MONGO_URI);

const sender = process.env.TOUR_NOTIFICATION_EMAIL || "";

const recipient = [process.env.TOUR_ADMIN_EMAIL_II];

const subject = "Tour Notification Cron Operation Log";

exports.cron = async (event, context) => {
  try {
    const cronLog = await TourNotification();

    const message = JSON.stringify(cronLog);

    if (!cronLog.log.status) {
      await Notify(sender, recipient, subject, message);
    }
  } catch (err) {
    const message = `${err.message}`;

    await Notify(sender, recipient, subject, message);
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
