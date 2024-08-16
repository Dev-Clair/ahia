const Config = require("./config");
const Connection = require("./src/service/connection");
const ConnectionError = require("./src/error/connectionError");
const DuplicateEventError = require("./src/error/duplicateeventError");
const Idempotent = require("./src/utils/idempotent");
const Mail = require("./mail");
const Retry = require("./src/utils/retry");
const Tour = require("./src/model/tourModel");
const VerifyAppSecret = require("./src/utils/verifyAppSecret");

const sender = Config.TOUR_NOTIFICATION_EMAIL;

const recipient = [Config.TOUR_ADMIN_EMAIL];

exports.tour = async (event, context) => {
  try {
    const { serviceName, serviceSecret, payload } = event.detail;

    let tourData;

    if (serviceName === Config.TOUR.SERVICE.NAME)
      tourData = (await VerifyAppSecret(serviceSecret))
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

    const tour = Retry.ExponentialJitterBackoff(() => createTour);

    console.log(tour);
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
