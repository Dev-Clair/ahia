const Config = require("./config");
const Connection = require("./connection");
const ConnectionError = require("./src/error/connectionError");
const Mail = require("./src/utils/mail");
const TourNotification = require("./cron/tourNotification");

const sender = Config.TOUR.NOTIFICATION_EMAIL || "";

const recipient = [Config.TOUR.ADMIN_EMAIL_I];

exports.cron = async (event, context) => {
  try {
    Connection(Config.MONGO_URI);

    const cron = await TourNotification();

    const message = JSON.stringify(cron);

    if (cron.status === false) {
      await Mail(sender, recipient, "TOUR NOTIFICATION: CRON LOG", message);
    }
  } catch (err) {
    if (err instanceof ConnectionError) {
      await Notify(
        sender,
        recipient,
        err.name.toUpperCase(),
        JSON.stringify({ message: err.message, description: err.description })
      );
    }

    console.log(err.name, err.message);
  }
};

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error);

  process.exitCode = 1;
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);

  process.exitCode = 1;
});
