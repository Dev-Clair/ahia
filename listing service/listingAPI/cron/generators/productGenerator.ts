import Log from "../../src/utils/logger";
import ProductService from "../../src/service/productService";

const ProductGenerator = async function* () {
  const limit = 100;

  let page = 1;

  let iterationCount = 0;

  let totalRetrieved = 0;

  while (true) {
    const products = await ProductService.Create().findAll(
      {
        "verification.status": false,
        type: { in: ["Lease", "Sell"] },
        page: page,
        limit: limit,
      },
      { retry: false }
    );

    if (products.length === 0 || !products) {
      Log.Cron.info("No products are unverified at the moment");

      break;
    }

    const currentDate = new Date(Date.now()).getTime();

    for (const product of products) {
      const creationDate = new Date(product.verification.expiry).getTime();

      const dateDifference = currentDate - creationDate;

      if (dateDifference > 3 * 24 * 60 * 60 * 1000) yield product;
    }

    totalRetrieved += products.length;

    iterationCount++;

    page++;

    Log.Cron.info(
      `Retrieved ${totalRetrieved} products on iteration count ${iterationCount}`
    );
  }
};

export default ProductGenerator;
