const Config = require("./config");
const Connection = require("./connection");
const NotifyAdmin = require("./notificationHandler");
const TourNotification = require("./tourNotification");

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error);
  process.exitCode = 1;
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exitCode = 1;
});

const shutdown = () => {
  console.log("Closing all open connections");

  mongoose.connection.close(true);

  process.on("SIGTERM", shutdown);
};

Connection(Config.MONGO_URI);

exports.cron = async (event, context) => {
  try {
    const eventSource = event.source;
    if (eventSource === "Ahia_Cron_Tour_Notification") {
      await TourNotification();
    } else if (eventSource === "Ahia_Cron_Clear_Logs") {
      await ClearLogs();
    } else {
      throw new Error(`Unidentified Event Source: ${eventSource}`);
    }
  } catch (err) {
    const from = process.env.TOUR_ADMIN_EMAIL_I || "";

    const to = [process.env.TOUR_ADMIN_EMAIL_II];

    const subject = "Cron Scheduler Error";

    const message = `${err.message}`;

    await NotifyAdmin(from, to, subject, message);
  }
};
