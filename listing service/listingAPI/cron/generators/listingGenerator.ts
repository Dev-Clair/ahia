import Log from "../../src/utils/logger";
import ListingService from "../../src/service/listingService";

const EXPIRY_THRESHOLD = 28 * 24 * 60 * 60 * 1000;

const ListingGenerator = async function* () {
  const limit = 100;

  let page = 1;

  let totalRetrieved = 0;

  while (true) {
    try {
      const currentDate = Date.now();

      const listings = await ListingService.Create().findAll(
        {
          "verification.status": { eq: "pending" },
          createdAt: { lte: new Date(currentDate - EXPIRY_THRESHOLD) },
          page,
          limit,
          fields: "name verification",
        },
        { retry: false }
      );

      if (!listings || listings.length === 0) {
        Log.Cron.info("No expired pending listings found.");

        break;
      }

      totalRetrieved += listings.length;

      Log.Cron.info(
        `Processing ${listings.length} expired listings (Total: ${totalRetrieved})`
      );

      for (const listing of listings) yield listing;

      page++;
    } catch (error: any) {
      Log.Cron.error(`Error in ListingGenerator: ${error.message}`);

      break;
    }
  }
};

export default ListingGenerator;
