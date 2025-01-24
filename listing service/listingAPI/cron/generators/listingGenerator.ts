import Log from "../../src/utils/logger";
import ListingService from "../../src/service/listingService";

const ListingGenerator = async function* () {
  const limit = 100;

  let page = 1;

  let iterationCount = 0;

  let totalRetrieved = 0;

  while (true) {
    const listings = await ListingService.Create().findAll(
      {
        "verification.status": { eq: "pending" },
        page: page,
        limit: limit,
        fields: "name verification createdAt",
      },
      { retry: false }
    );

    console.log("listings: ", listings);

    if (listings.length === 0 || !listings) {
      Log.Cron.info("No listings are unapproved at the moment");

      break;
    }

    const currentDate = Date.now();

    console.log("listings, current date: ", currentDate);

    for (const listing of listings) {
      if (!listing.createdAt) {
        Log.Cron.warn(
          `Listing ${listing._id} is missing 'createdAt'. Skipping.`
        );

        continue;
      }

      const creationDate = new Date(listing.createdAt).getTime();

      console.log("listings, creation date: ", creationDate);

      if (isNaN(creationDate)) {
        Log.Cron.warn(
          `Invalid 'createdAt' format for listing ${listing._id}: ${listing.createdAt}. Skipping.`
        );

        continue;
      }

      const dateDifference = currentDate - creationDate;

      console.log("listings, date difference: ", dateDifference);

      if (dateDifference > 28 * 24 * 60 * 60 * 1000) yield listing;
    }

    totalRetrieved += listings.length;

    iterationCount++;

    page++;

    Log.Cron.info(
      `Retrieved ${totalRetrieved} listings on iteration count ${iterationCount}`
    );
  }
};

export default ListingGenerator;
