const mongoose = require("mongoose");
const Cache = require("../src/service/cache");
const Config = require("../config");
const Listing = require("../src/model/listingModel");
const ListingGenerator = require("./listingGenerator");
const Mail = require("../src/utils/mail");
const MailerError = require("../src/error/mailerError");
const Retry = require("../src/utils/retry");

let successCount = 0;

let failedCount = 0;

let errorCache = new Cache.SetCache();

const sender = Config.LISTING_NOTIFICATION_EMAIL;

const getMessage = (name, status) => {
  return `The listing reference ${
    status.id
  } for listing ${name.toUpperCase()} have expired and the listing have been deleted due to failure to make payment before the deadline ${new Date(
    status.expiry
  ).toDateString()}.\nKindly recreate listing and make payment with the new listing reference to enable visibility your listing.`;
};

const ListingCron = async () => {
  const listingGenerator = ListingGenerator();

  for await (const listing of listingGenerator) {
    const { id, name, provider, status } = listing;

    const text = getMessage(name, status);

    try {
      const session = await mongoose.startSession();

      const removeListing = await session.withTransaction(async () => {
        const listing = await Listing.findByIdAndDelete(
          { _id: id },
          { session }
        );

        if (!listing) throw new Error(`No record found for listing ${id}`);
      });

      await Retry.ExponentialBackoff(() => removeListing);

      await Mail(
        sender,
        [provider.email],
        `LISTING ${name.toUpperCase()} REMOVAL`,
        text
      );

      successCount++;
    } catch (err) {
      errorCache.set(
        err.name,
        `Failed to remove listing:\nError: ${err.message}`
      );

      failedCount++;
    }
  }

  return {
    log: {
      success: successCount,
      failed: failedCount,
    },
    status: errorCache.size() === 0,
    error: {
      count: errorCache.size(),
      errors: errorCache.entries(),
    },
  };
};

module.exports = ListingCron;
