import mongoose from "mongoose";
import DbConnectionServiceError from "../error/dbconnectionserviceError";
import Retry from "../utils/retry";

/**
 * Establishes connection to database
 * @param connectionUri
 */
const establishConnection = async (connectionUri: string): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 120,
      minPoolSize: 20,
      socketTimeoutMS: 60000,
    });
  }
};

/**
 * Provides connection resource with round robin retry strategy on failure
 * @param connectionUri
 */
const DbConnectionService = async (connectionUri: string): Promise<void> => {
  try {
    await Retry.ExponentialBackoff(() => establishConnection(connectionUri));
  } catch (err: any) {
    try {
      await Retry.LinearJitterBackoff(() => establishConnection(connectionUri));
    } catch (err: any) {
      throw new DbConnectionServiceError(
        err.message,
        "Retry strategies failed. Could not establish connection to the database"
      );
    }
  }
};

export default DbConnectionService;
