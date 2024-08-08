const Cache = require("./cache");
const Config = require("./config");
const Listing = require("./listingModel");
const ListingGenerator = require("./listingGenerator");
const Mail = require("./mail");
const MailerError = require("./mailerError");

let successCount = 0;

let failedCount = 0;

let errorCache = new Cache.SetCache();

const sender = Config.LISTING_NOTIFICATION_EMAIL;

const getMessage = (name, status) => {
  return `The transaction reference ${
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
      await Listing.findByIdAndDelete({ _id: id });

      await Mail(
        sender,
        [provider.email],
        `LISTING ${name.toUpperCase()} REMOVAL`,
        text
      );

      successCount++;
    } catch (err) {
      if (err instanceof MailerError) {
        throw err;
      }

      errorCache.set(
        id,
        `Failed to remove listing:\nName:${name.toUpperCase()}\nId:${id}\nError: ${
          err.message
        }`
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
