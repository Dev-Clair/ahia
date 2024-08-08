const Config = require("./config");
const CryptoHash = require("./cryptoHash");
const Listing = require("./listingModel");
const Mail = require("./mail");

const sender = Config.LISTING.NOTIFICATION_EMAIL;

const recipient = [Config.LISTING.ADMIN_EMAIL_I];

exports.listing = async (event, context) => {
  try {
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
          { new: true }
        );

        await Mail(
          sender,
          [listing.provider.email],
          "LISTING APPROVAL",
          `Your listing ${listing.name.toUpperCase()} has been approved for listing.\nKindly proceed to add attachments and create promotions for your listing.`
        );
      }
    }
  } catch (err) {
    await Mail(sender, recipient, "EVENT: LISTING APPROVAL ERROR", err.message);

    console.error(err);
  }
};
