import mongoose from "mongoose";
import Product from "../../src/model/productModel";
import Log from "../../src/utils/logger";

export const ProductsCollectionCleanUp = async () => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      Log.Cron.info(
        `Products collection cleanup job started successfuly: ${new Date().toLocaleDateString()}`
      );

      const output = await Product.deleteMany(
        {
          "verification.status": false,
          "verification.expiry": { $lt: new Date() },
          type: { $in: ["Lease", "Sell"] },
        },
        session
      );

      Log.Cron.info(`Deleted ${output.deletedCount} unverified products`);
    });
  } catch (error: any) {
    await session.abortTransaction();

    Log.Cron.error(
      `Products collection cleanup job failed with error: ${error.message}`
    );

    throw error;
  } finally {
    await session.endSession();
  }
};
