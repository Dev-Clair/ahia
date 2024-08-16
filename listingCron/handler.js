const Config = require("./config");
const Connection = require("./src/service/connection");
const ConnectionError = require("./src/error/connectionError");
const Mail = require("./mail");
const MailerError = require("./src/error/mailerError");
const ListingCron = require("./cron/listingCron");

const sender = Config.LISTING.NOTIFICATION_EMAIL;

const recipient = [Config.LISTING.ADMIN_EMAIL];

exports.cron = async (event, context) => {
  try {
    await Connection(Config.MONGO_URI);

    const cronLog = await ListingCron();

    if (cronLog.status === false) {
      await Mail(
        sender,
        recipient,
        "LISTING EXPIRY CRON LOG",
        JSON.stringify(cronLog)
      );
    }
  } catch (err) {
    if (err instanceof ConnectionError) {
      await Mail(
        sender,
        recipient,
        err.name.toUpperCase(),
        JSON.stringify({
          name: err.name,
          message: err.message,
          description: err.description,
        })
      );
    }

    if (err instanceof MailerError) {
      console.log(err.name, err.message);

      process.kill(process.pid, SIGTERM);
    }
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

process.on("SIGTERM", () => (process.exitCode = 1));
