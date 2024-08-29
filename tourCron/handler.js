const Config = require("./config");
const Connection = require("./src/service/connection");
const Sentry = require("@sentry/aws-serverless");
const TourNotification = require("./cron/tourNotification");

Sentry.init({
  dsn: Config.TOUR.CRON_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: Config.NODE_ENV,
});

exports.tourCron = Sentry.wrapHandler(async (event, context) => {
  console.log(`Ahia Tour Cron: ${new Date().now().toUTCString()}`);

  try {
    await Connection(Config.MONGO_URI);

    await TourNotification();
  } catch (err) {
    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception thrown:", error);

      Sentry.captureMessage(`Uncaught Exception thrown: ${error}`);

      process.exitCode = 1;
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);

      Sentry.captureMessage(
        `Unhandled Rejection at: ${promise}, reason: ${reason}`
      );

      process.exitCode = 1;
    });
  }
});
