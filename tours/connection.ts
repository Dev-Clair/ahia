import mongoose from "mongoose";
import {
  ExponentialRetry,
  LinearJitterRetry,
} from "./api/utils/retryHandler/retryHandler";
import Logger from "./api/service/loggerService";

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
    ExponentialRetry(establishConnection(connectionUri));
  } catch (err1: any) {
    Logger.error(
      `${__filename}: Exponential retry strategy failed, switching to linear jitter backoff. Error: ${err1.message}`
    );
    try {
      LinearJitterRetry(establishConnection(connectionUri));
    } catch (err2: any) {
      Logger.error(
        `${__filename}: Linear jitter retry strategy failed as well. Final error: ${err2.message}`
      );
      const subject = "Database Connection Failure";

      const message = `Backoff retry strategies failed. Could not establish connection to the database. Error: ${err2.message}`;

      // await notificationHandler.notifyAdmin();

      process.exitCode = 1;
    }
  }
};

mongoose.connection.on("connecting", () => {
  console.log(`${__filename}: Attempting connection to database`);
});

mongoose.connection.on("connected", () => {
  console.log(`${__filename}: Database connection successful`);
});

mongoose.connection.on("disconnected", () => {
  console.error(`${__filename}: Database connection failure`);
});

mongoose.connection.on("reconnected", () => {
  console.log(`${__filename}: Database reconnection successful`);
});

export default Connection;
