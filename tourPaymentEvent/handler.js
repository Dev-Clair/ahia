const Config = require("./config");
const Connection = require("./src/service/connection");
const ConnectionError = require("./src/error/connectionError");
const DuplicateEventError = require("./src/error/duplicateeventError");
const Idempotent = require("./src/utils/idempotent");
const Mail = require("./mail");
const Retry = require("./src/utils/retry");
const Tour = require("./src/model/tourModel");

const sender = Config.TOUR_NOTIFICATION_EMAIL;

const recipient = [Config.TOUR_ADMIN_EMAIL_I];

exports.tour = async (event, context) => {
  try {
    await Connection(Config.MONGO_URI);

    const payload = JSON.parse(event.detail);

    const { customer, listings, paymentReference } = payload;

    if (await Idempotent.Verify(paymentReference)) {
      throw new DuplicateEventError(
        `Duplicate event detected for payment reference: ${paymentReference}`
      );
    }

    const session = await mongoose.startSession();

    const transaction = await session.withTransaction(async () => {
      await Tour.create([{ customer, listings }], { session: session });

      await Idempotent.Ensure(paymentReference, session);
    });

    const operation = Retry.ExponentialJitterBackoff(() => transaction);

    console.log(operation);
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

    Mail(
      sender,
      recipient,
      "EVENT: TOUR CREATION ERROR",
      JSON.stringify({ name: err.name, message: err.message, payload: payload })
    );

    console.error(err);
  }
};
