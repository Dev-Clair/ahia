import * as Sentry from "@sentry/node";
import Log from "../../src/utils/logger";
import ProductGenerator from "../generators/productGenerator";
import ListingService from "../../src/service/listingService";

export const ProductsCollectionCleanUp = async () => {
  try {
    Log.Cron.info(
      `Products collection cleanup job started successfuly: ${new Date().toLocaleDateString()}`
    );

    const productGenerator = ProductGenerator();

    for await (const product of productGenerator) {
      const id = product._id.toString();

      await ListingService.Create().deleteListingProduct(id, {
        idempotent: null,
        retry: false,
      });
    }

    Log.Cron.info(`Products collection cleanup job completed successfuly`);
  } catch (error: any) {
    Sentry.withScope((scope) => {
      scope.setTag("Products Collection Cleanup Error", "Warn");

      scope.setContext("Error", error);

      Sentry.captureException(error);
    });

    Log.Cron.error(
      `Products collection cleanup job failed with error: ${error.message}`
    );

    // throw error;
  }
};
