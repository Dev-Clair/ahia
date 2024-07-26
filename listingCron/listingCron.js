const Cache = require("./cache");
const Listing = require("./listingModel");
const ListingGenerator = require("./listingGenerator");

let successCount = 0;

let failedCount = 0;

let errorCache = new Cache.SetCache();

const ListingCron = async () => {
  const listingGenerator = ListingGenerator();

  for await (const listing of listingGenerator) {
    const { id, name, provider, reference } = listing;

    try {
      await Listing.findOneAndDelete({ _id: id });

      successCount++;
    } catch (err) {
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
