const Config = require("./config");
const Connection = require("./src/service/connection");
const ConnectionError = require("./src/error/connectionError");
const DuplicateEventError = require("./src/error/duplicateeventError");
const Idempotent = require("./src/utils/idempotent");
const Mail = require("./mail");
const MailerError = require("./src/error/mailerError");
const Retry = require("./src/utils/retry");
const Tour = require("./src/model/tourModel");
const VerifySecret = require("./src/utils/verifySecret");

const sender = Config.TOUR_NOTIFICATION_EMAIL;

const recipient = [Config.TOUR_ADMIN_EMAIL];

exports.tour = async (event, context) => {
  try {
    const { serviceName, serviceSecret, payload } = event.detail;

    let tourData;

    if (serviceName === Config.TOUR.SERVICE.NAME)
      tourData = (await VerifySecret(
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

    await Connection(Config.MONGO_URI);

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
      console.error(err.name, err.message);

      process.kill(process.pid, SIGTERM);
    }

    await Mail(
      sender,
      recipient,
      "EVENT: TOUR CREATION ERROR",
      JSON.stringify({
        name: err.name,
        message: err.message,
        payload: tourData,
      })
    );

    console.error(err);
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
