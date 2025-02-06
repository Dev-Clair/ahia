import * as Sentry from "@sentry/node";
import Log from "../../src/utils/logger";
import ListingGenerator from "../generators/listingGenerator";
import ListingService from "../../src/service/listingService";

export const ListingsCollectionCleanUp = async () => {
  Log.Cron.info(
    `Listings collection cleanup job started: ${new Date().toUTCString()}`
  );

  try {
    const listingGenerator = ListingGenerator();

    for await (const listing of listingGenerator) {
      const id = listing._id.toString();

      try {
        await ListingService.Create().deleteById(id, { retry: false });

        Log.Cron.info(`Deleted expired listing: ${id}`);
      } catch (error: any) {
        Log.Cron.error(`Failed to delete listing ${id}: ${error.message}`);

        Sentry.captureException(error);
      }
    }

    Log.Cron.info(`Listings collection cleanup job completed successfully.`);
  } catch (error: any) {
    Sentry.captureException(error);

    Log.Cron.error(`Listings cleanup job failed: ${error.message}`);
  }
};
