import Product from "../../src/model/productModel";
import Log from "../../src/utils/logger";

const ProductGenerator = async function* () {
  const limit = 100;

  let skip = 0;

  let iterationCount = 0;

  let totalRetrieved = 0;

  while (true) {
    const products = await Product.find({
      "verification.status": false,
      type: { $in: ["Lease", "Sell"] },
    })
      .skip(skip * limit)
      .limit(limit);

    if (products.length === 0 || !products) {
      Log.Cron.info("No products are unverified at the moment");

      break;
    }

    const currentDate = new Date().getTime();

    for (const product of products) {
      const creationDate = new Date(product.verification.expiry).getTime();

      const dateDifference = currentDate - creationDate;

      if (dateDifference > 3 * 24 * 60 * 60 * 1000) yield product;
    }

    totalRetrieved += products.length;

    iterationCount++;

    skip++;

    Log.Cron.info(`Retrieved ${totalRetrieved} products on ${iterationCount}`);
  }
};

export default ProductGenerator;
