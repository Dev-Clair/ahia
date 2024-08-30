const mongoose = require("mongoose");
const Listing = require("../src/model/listing");
const ListingGenerator = require("./listingGenerator");
const Retry = require("../src/utils/retry");

const ListingCron = async () => {
  const listingGenerator = ListingGenerator();

  for await (const listing of listingGenerator) {
    const id = listing._id;

    const session = await mongoose.startSession();

    const removeListing = await session.withTransaction(async () => {
      const record = await Listing.findByIdAndDelete({ _id: id }, { session });

      if (!record) throw new Error(`No record found for listing: ${id}`);
    });

    await Retry.ExponentialBackoff(() => removeListing);
  }
};

module.exports = ListingCron;
