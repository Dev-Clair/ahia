const mongoose = require("mongoose");
const Config = require("./config");
const Connection = require("./connection");
const ConnectionError = require("./connectionError");
const CryptoHash = require("./cryptoHash");
const Listing = require("./listingModel");
const Mail = require("./mail");

const sender = Config.LISTING.NOTIFICATION_EMAIL;

const recipient = [Config.LISTING.ADMIN_EMAIL_I];

exports.listing = async (event, context) => {
  try {
    await Connection(Config.MONGO_URI);

    const session = await mongoose.startSession();

    await session.withTransaction(async () => {
      const eventBody = JSON.parse(event.detail);

      const { serviceName, serviceSecret, payload } = eventBody;

      if (serviceName === Config.LISTING.SERVICE.NAME) {
        const verifySecret =
          serviceSecret ===
          (await CryptoHash(Config.LISTING.SERVICE.SECRET, Config.APP_SECRET));

        if (verifySecret) {
          const listing = await Listing.findByIdAndUpdate(
            { _id: payload.id },
            { $set: { status: { approved: true } } },
            { new: true, session }
          );

          await Mail(
            sender,
            [listing.provider.email],
            "LISTING APPROVAL",
            `Your listing ${listing.name.toUpperCase()} has been approved for listing.\nKindly proceed to add attachments and create promotions for your listing.`
          );
        }
      }
    });
  } catch (err) {
    if (err instanceof ConnectionError) {
      const text = {
        name: err.name,
        message: err.message,
        description: err.description,
      };

      await Mail(sender, recipient, err.name.toUpperCase(), err.message);
    }

    if (err instanceof MailerError) {
      console.log(err.name, err.message);

      process.kill(process.pid, SIGTERM);
    }

    console.error(err);
  } finally {
    await session.endSession();
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
