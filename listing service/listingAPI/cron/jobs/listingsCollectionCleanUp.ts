import mongoose from "mongoose";
import Listing from "../../src/model/listingModel";
import Log from "../../src/utils/logger";

export const ListingsCollectionCleanUp = async () => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      Log.Cron.info(
        `Listings collection cleanup job started successfuly: ${new Date().toLocaleDateString()}`
      );

      const output = await Listing.deleteMany(
        {
          "verification.status": { $eq: "rejected" },
          createdAt: {
            $gt: new Date().getMilliseconds() * 30 * 24 * 60 * 60 * 1000,
          },
        },
        session
      );

      Log.Cron.info(`Deleted ${output.deletedCount} unverified listings`);
    });
  } catch (error: any) {
    await session.abortTransaction();

    Log.Cron.error(
      `Listings collection cleanup job failed with error: ${error.message}`
    );

    throw error;
  } finally {
    await session.endSession();
  }
};
