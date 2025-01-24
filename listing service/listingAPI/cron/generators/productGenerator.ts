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
        fields: "name verification createdAt",
      },
      { retry: false }
    );

    console.log("products: ", products);

    if (products.length === 0 || !products) {
      Log.Cron.info("No products are unverified at the moment");

      break;
    }

    const currentDate = Date.now();

    console.log("products, current date: ", currentDate);

    for (const product of products) {
      if (!product.verification.expiry) {
        Log.Cron.warn(`Product ${product._id} is missing 'expiry'. Skipping.`);

        continue;
      }

      const expiryDate = new Date(product.verification.expiry).getTime();

      console.log("products, expiry date: ", expiryDate);

      if (isNaN(expiryDate)) {
        Log.Cron.warn(
          `Invalid 'expiry' for product ${product._id}: ${product.verification.expiry}. Skipping.`
        );

        continue;
      }

      const dateDifference = currentDate - expiryDate;

      console.log("products, date difference: ", dateDifference);

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
