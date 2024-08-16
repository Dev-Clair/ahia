const mongoose = require("mongoose");
const Config = require("./config");
const Connection = require("./connection");
const ConnectionError = require("./src/error/connectionError");
const Listing = require("./src/model/listingModel");
const Mail = require("./src/utils/mail");
const MailerError = require("./src/error/mailerError");
const Retry = require("./src/utils/retry");
const VerifySecret = require("./src/utils/verifySecret");

const sender = Config.LISTING.NOTIFICATION_EMAIL;

const recipient = [Config.LISTING.ADMIN_EMAIL];

exports.listing = async (event, context) => {
  try {
    const { serviceName, serviceSecret, payload } = event.detail;

    let listingData;

    if (serviceName === Config.LISTING.SERVICE.NAME)
      listingData = (await VerifySecret(
        serviceSecret,
        Config.LISTING.SERVICE.SECRET,
        Config.APP_SECRET
      ))
        ? JSON.parse(payload)
        : null;

    if (listingData === null)
      throw new Error(
        `Invalid service name: ${serviceName} and secret: ${serviceSecret}`
      );

    await Connection(Config.MONGO_URI);

    const { id, name, email } = listingData;

    const session = await mongoose.startSession();

    const approveStatus = await session.withTransaction(async () => {
      const listing = await Listing.findByIdAndUpdate(
        { _id: id },
        { $set: { status: { approved: true } } },
        { new: true, session }
      );

      if (!listing) throw new Error(`No record found for listing ${id}`);
    });

    await Retry.ExponentialJitterBackoff(() => approveStatus);

    await Mail(
      sender,
      [email],
      "LISTING APPROVAL",
      `Your listing ${name.toUpperCase()} has been approved for listing. Kindly proceed to add attachments and create promotions for your listing.`
    );
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
      "EVENT: LISTING STATUS UPDATE ERROR",
      JSON.stringify({
        name: err.name,
        message: err.message,
        payload: listingData,
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
