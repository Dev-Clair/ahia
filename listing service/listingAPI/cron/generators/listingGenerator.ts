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
        "verification.status": { eq: "rejected" },
        page: page,
        limit: limit,
      },
      { retry: false }
    );

    if (listings.length === 0 || !listings) {
      Log.Cron.info("No listings are unapproved at the moment");

      break;
    }

    const currentDate = new Date(Date.now()).getTime();

    for (const listing of listings) {
      const creationDate = new Date(listing.createdAt).getTime();

      const dateDifference = currentDate - creationDate;

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
