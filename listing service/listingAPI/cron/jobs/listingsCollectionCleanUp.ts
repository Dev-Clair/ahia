import * as Sentry from "@sentry/node";
import Log from "../../src/utils/logger";
import ListingGenerator from "../generators/listingGenerator";
import ListingService from "../../src/service/listingService";

export const ListingsCollectionCleanUp = async () => {
  try {
    Log.Cron.info(
      `Listings collection cleanup job started successfuly: ${new Date().toUTCString()}`
    );

    const listingGenerator = ListingGenerator();

    for await (const listing of listingGenerator) {
      const id = listing._id.toString();

      await ListingService.Create().deleteById(id, {
        retry: false,
      });
    }

    Log.Cron.info(`Listings collection cleanup job completed successfuly`);
  } catch (error: any) {
    Sentry.withScope((scope) => {
      scope.setTag("Listing Collection Cleanup Error", "Warn");

      scope.setContext("Error", error);

      Sentry.captureException(error);
    });

    Log.Cron.error(
      `Listings collection cleanup job failed with error: ${error.message}`
    );

    // throw error;
  }
};
