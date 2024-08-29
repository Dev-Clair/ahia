const Config = require("./config");
const DuplicateEventError = require("./src/error/duplicateeventError");
const Idempotent = require("./src/utils/idempotent");
const Retry = require("./src/utils/retry");
const Tour = require("./src/model/tour");
const Secret = require("./src/utils/secret");

export const CreateTour = async (event) => {
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
};
