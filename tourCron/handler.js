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
  console.log(`Ahia Tour Cron Lambda: ${new Date().now().toUTCString()}`);

  try {
    await Connection.Make(Config.MONGO_URI).getConnection();

    await TourNotification();
  } catch (err) {
    (scope) => {
      scope.setTag("Error", "Ahia Tour Cron");

      scope.setContext("Lambda", {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });

      Sentry.captureException(err);
    };
  }

  process
    .on("uncaughtException", (error) => {
      console.error("Uncaught Exception thrown:", error);

      Sentry.captureMessage(`Uncaught Exception thrown: ${error}`);

      process.exitCode = 1;
    })
    .on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);

      Sentry.captureMessage(
        `Unhandled Rejection at: ${promise}, reason: ${reason}`
      );

      process.exitCode = 1;
    });

  mongoose.connection
    .on("connecting", () => console.info(`Attempting connection to database`))
    .on("connected", () => console.info(`Database connection successful`))
    .on("disconnected", () => console.info(`Database connection failure`))
    .on("reconnected", () => console.info(`Database reconnection successful`));
});
