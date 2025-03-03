import Log from "../../src/utils/logger";
import ProductService from "../../src/service/productService";

const EXPIRY_THRESHOLD = 3 * 24 * 60 * 60 * 1000;

const ProductGenerator = async function* () {
  const limit = 100;

  let page = 1;

  let totalRetrieved = 0;

  while (true) {
    try {
      const currentDate = Date.now();

      const products = await ProductService.Create().findAll(
        {
          "verification.status": false,
          "verification.expiry": {
            lte: new Date(currentDate - EXPIRY_THRESHOLD),
          },
          type: { in: ["Lease", "Sell"] },
          page,
          limit,
        },
        { retry: false }
      );

      if (!products || products.length === 0) {
        Log.Cron.info("No expired unverified products found.");

        break;
      }

      totalRetrieved += products.length;

      Log.Cron.info(
        `Processing ${products.length} expired products (Total: ${totalRetrieved})`
      );

      for (const product of products) yield product;

      page++;
    } catch (error: any) {
      Log.Cron.error(`Error in ProductGenerator: ${error.message}`);

      break;
    }
  }
};

export default ProductGenerator;
