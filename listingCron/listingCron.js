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

const ListingCron = async () => {
  const listingGenerator = ListingGenerator();

  for await (const listing of listingGenerator) {
    const { id, name, provider, reference } = listing;

    const text = `The transaction reference ${
      reference.id
    } for listing ${name} have expired and the listing ${name} have been deleted due to failure to make payment before the deadline ${new Date(
      reference.expiry
    ).toDateString()}.\nKindly recreate listing and make payment on the new listing reference to secure your listing.`;

    try {
      await Listing.findByIdAndDelete({ _id: id });

      await Mail(sender, [provider.email], `LISTING ${name} REMOVAL`, text);

      successCount++;
    } catch (err) {
      if (err instanceof MailerError) {
        throw err;
      }

      errorCache.set(
        id,
        `Failed to remove listing:\nName:${name}\nId:${id}\nError: ${err.message}`
      );

      failedCount++;
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
  }
};

module.exports = ListingCron;
