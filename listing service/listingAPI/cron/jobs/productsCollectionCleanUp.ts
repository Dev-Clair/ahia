import * as Sentry from "@sentry/node";
import Log from "../../src/utils/logger";
import ProductGenerator from "../generators/productGenerator";
import ProductService from "../../src/service/productService";

export const ProductsCollectionCleanUp = async () => {
  Log.Cron.info(
    `Products collection cleanup job started: ${new Date().toUTCString()}`
  );

  try {
    const productGenerator = ProductGenerator();

    for await (const product of productGenerator) {
      const id = product._id.toString();

      try {
        await ProductService.Create().deleteById(id, {
          idempotent: null,
          retry: false,
        });

        Log.Cron.info(`Deleted expired product: ${id}`);
      } catch (error: any) {
        Log.Cron.error(`Failed to delete product ${id}: ${error.message}`);

        Sentry.captureException(error);
      }
    }

    Log.Cron.info(`Products collection cleanup job completed successfully.`);
  } catch (error: any) {
    Sentry.captureException(error);

    Log.Cron.error(`Products cleanup job failed: ${error.message}`);
  }
};
