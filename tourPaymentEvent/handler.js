const Config = require("./config");
const Connection = require("./src/service/connection");
const DuplicateEventError = require("./src/error/duplicateeventError");
const Idempotent = require("./src/utils/idempotent");
const Retry = require("./src/utils/retry");
const Tour = require("./src/model/tour");
const Secret = require("./src/utils/secret");
const Sentry = require("@sentry/aws-serverless");

Sentry.init({
  dsn: Config.TOUR.PAYMENT_EVENT_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: Config.NODE_ENV,
});

exports.tourPayment = Sentry.wrapHandler(async (event, context) => {
  console.log(
    `Ahia Tour Payment Event Lambda: ${new Date().now().toUTCString()}`
  );

  try {
    const { serviceName, serviceSecret, payload } = event.detail;

    let tourData;

    if (serviceName === Config.TOUR.SERVICE.NAME)
      tourData = (await Secret.Verify(
        serviceSecret,
        Config.TOUR.SERVICE.SECRET,
        Config.APP_SECRET
      ))
        ? JSON.parse(payload)
        : null;

    if (tourData === null)
      throw new Error(
        `Invalid service name: ${serviceName} and secret: ${serviceSecret}`
      );

    await Connection.Create(Config.MONGO_URI).getConnection();

    const { customer, listings, paymentReference } = tourData;

    if (await Idempotent.Verify(paymentReference))
      throw new DuplicateEventError(
        `Duplicate event detected for payment reference: ${paymentReference}`
      );

    const session = await mongoose.startSession();

    const createTour = await session.withTransaction(async () => {
      await Tour.create([{ customer, listings }], { session: session });

      await Idempotent.Ensure(paymentReference, session);
    });

    await Retry.ExponentialJitterBackoff(() => createTour);
  } catch (err) {
    Sentry.withScope((scope) => {
      scope.setTag("Error", "Ahia Payment Event Cron");

      scope.setContext("Lambda", {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });

      Sentry.captureException(err);
    });
  }

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
});
