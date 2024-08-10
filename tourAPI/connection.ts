import mongoose from "mongoose";
import ConnectionError from "./src/error/connectionError";
import Retry from "./src/utils/retry";

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
const Connection = async (connectionUri: string): Promise<void> => {
  try {
    await Retry.ExponentialBackoff(() => establishConnection(connectionUri));
  } catch (err: any) {
    try {
      await Retry.LinearJitterBackoff(() => establishConnection(connectionUri));
    } catch (err: any) {
      throw new ConnectionError(
        err.message,
        "Retry strategies failed. Could not establish connection to the database"
      );
    }
  }
};

mongoose.connection.on("connecting", () => {
  console.log(`Attempting connection to database`);
});

mongoose.connection.on("connected", () => {
  console.log(`Database connection successful`);
});

mongoose.connection.on("disconnected", () => {
  console.error(`Database connection failure`);
});

mongoose.connection.on("reconnected", () => {
  console.log(`Database reconnection successful`);
});

export default Connection;
