// const timezone = require("moment-timezone");
const Listing = require("../src/model/listing");

const ListingGenerator = async function* () {
  const limit = 100;

  let skip = 0;

  let iterationCount = 0;

  let totalRetrieved = 0;

  while (true) {
    const listings = await Listing.find({
      status: {
        approved: false,
        expiry: { $lte: new Date() },
      },
    })
      .skip(skip * limit)
      .limit(limit);

    if (listings.length === 0 || !listings) {
      console.log("No listings are unapproved at the moment");
      break;
    }

    const now = new Date().getTime();

    for (const listing of listings) {
      const expiry = new Date(listing.status.expiry).getTime();

      const diff = expiry - now;

      if (diff > 0) yield listing;
    }

    totalRetrieved += listings.length;

    iterationCount++;

    skip++;

    console.log(`Retrieved ${totalRetrieved} listings on ${iterationCount}`);
  }
};

module.exports = ListingGenerator;
