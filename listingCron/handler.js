const Config = require("./config");
const Connection = require("./connection");
const ConnectionError = require("./connectionError");
const Mail = require("./mail");
const MailerError = require("./mailerError");
const ListingCron = require("./listingCron");

const sender = Config.LISTING_NOTIFICATION_EMAIL || "";

const recipient = [Config.LISTING_ADMIN_EMAIL_I];

exports.cron = async (event, context) => {
  try {
    Connection(Config.MONGO_URI);

    const cronLog = await ListingCron();

    const message = JSON.stringify(cronLog);

    if (cronLog.status === false) {
      await Mail(sender, recipient, "LISTING CRON LOG", message);
    }
  } catch (err) {
    if (err instanceof ConnectionError) {
      const text = { message: err.message, description: err.description };

      await Mail(
        sender,
        recipient,
        err.name.toUpperCase(),
        JSON.stringify(text)
      );
    }

    if (err instanceof MailerError) {
      console.log(err.name, err.message);

      process.kill(process.pid, SIGTERM);
    }

    // Set up node-mailer as failure notification service
    // const text = { message: err.message, trace: err.stack };

    // await Mail(sender, recipient, "CRITICAL ERROR", JSON.stringify(text));
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
