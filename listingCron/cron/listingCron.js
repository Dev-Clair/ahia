const mongoose = require("mongoose");
const Cache = require("../src/service/cache");
const Listing = require("../src/model/listing");
const ListingGenerator = require("./listingGenerator");
const Retry = require("../src/utils/retry");

const ListingCron = async () => {
  const deleteCache = new Cache.SetCache();

  const listingGenerator = ListingGenerator();

  for await (const listing of listingGenerator) {
    const session = await mongoose.startSession();

    const removeListing = await session.withTransaction(async () => {
      const listing = await Listing.findByIdAndDelete(
        { _id: Listing._id },
        { session }
      );

      if (!listing) throw new Error(`No record found for listing ${id}`);
    });

    await Retry.ExponentialBackoff(() => removeListing);

    deleteCache.set(provider.email, listing.name);
  }

  return {
    log: {
      count: deleteCache.size(),
      result: deleteCache.entries(),
    },
  };
};

module.exports = ListingCron;
