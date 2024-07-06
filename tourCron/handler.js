const Config = require("./config");
const Connection = require("./connection");
const Notify = require("./util/notify");
const TourNotification = require("./job/tourNotification");

Connection(Config.MONGO_URI);

const from = process.env.TOUR_NOTIFICATION_EMAIL || "";

const to = [process.env.TOUR_ADMIN_EMAIL_II];

exports.cron = async (event, context) => {
  try {
    const counts = await TourNotification();

    const subject = "Tour Notification Cron Operation Report";

    const message = JSON.stringify(counts);

    await Notify(from, to, subject, message);
  } catch (err) {
    const subject = "Tour Notification Cron Operation Error";

    const message = `${err.message}`;

    await Notify(from, to, subject, message);
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
