const Config = require("./config");
const Connection = require("./connection");
const ConnectionError = require("./connectionError");
const MailerError = require("./mailerError");
const Notify = require("./notify");
const TourNotification = require("./tourNotification");

const sender = process.env.TOUR_NOTIFICATION_EMAIL || "";

const recipient = [process.env.TOUR_ADMIN_EMAIL_II];

exports.cron = async (event, context) => {
  try {
    Connection(Config.MONGO_URI);

    const cronLog = await TourNotification();

    const message = JSON.stringify(cronLog);

    if (!cronLog.log.status) {
      await Notify(
        sender,
        recipient,
        "OPERATION LOG: CRON TOUR NOTIFICATION",
        message
      );
    }
  } catch (err) {
    if (err instanceof ConnectionError) {
      const message = { message: err.message, description: err.description };

      await Notify(
        sender,
        recipient,
        err.name.toUpperCase(),
        JSON.stringify(message)
      );
    }

    if (err instanceof MailerError) {
      console.log(err.name, "AWS SES ERROR", err.message);

      process.kill(process.pid, SIGTERM);
    }

    const message = `${err.message}\n${err.stack}`;

    await Notify(sender, recipient, "CRITICAL ERROR", message);
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
