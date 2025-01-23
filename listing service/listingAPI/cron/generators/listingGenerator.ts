import Listing from "../../src/model/listingModel";
import Log from "../../src/utils/logger";

const ListingGenerator = async function* () {
  const limit = 100;

  let skip = 0;

  let iterationCount = 0;

  let totalRetrieved = 0;

  while (true) {
    const listings = await Listing.find({
      "verification.status": { $eq: "rejected" },
    })
      .skip(skip * limit)
      .limit(limit);

    if (listings.length === 0 || !listings) {
      Log.Cron.info("No listings are unapproved at the moment");

      break;
    }

    const currentDate = new Date().getTime();

    for (const listing of listings) {
      const creationDate = new Date(listing.createdAt).getTime();

      const dateDifference = currentDate - creationDate;

      if (dateDifference > 28 * 24 * 60 * 60 * 1000) yield listing;
    }

    totalRetrieved += listings.length;

    iterationCount++;

    skip++;

    Log.Cron.info(`Retrieved ${totalRetrieved} listings on ${iterationCount}`);
  }
};

export default ListingGenerator;
