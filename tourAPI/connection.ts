import mongoose from "mongoose";
import Retry from "./src/utils/retry";

const establishConnection = async (
  connectionUri: string
): Promise<void | typeof mongoose> => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 10000,
    });
  }
};

const Connection = async (
  connectionUri: string
): Promise<void | typeof mongoose> => {
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
