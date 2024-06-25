import mongoose from "mongoose";
import logger from "./src/service/loggerService";
import retryHandler from "./api/utils/retryHandler/retryHandler";
import notificationHandler from "./api/utils/notificationHandler/notificationHandler";

const establishConnection = async (connectionUri: string): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 10000,
    });
  }
};

const Connection = async (
  connectionUri: string
): Promise<void | typeof import("mongoose")> => {
  try {
    retryHandler.ExponentialRetry(establishConnection(connectionUri));
  } catch (err1: any) {
    console.error(
      `Exponential retry strategy failed, switching to linear jitter backoff. Error: ${err1.message}`
    );
    try {
      retryHandler.LinearJitterRetry(establishConnection(connectionUri));
    } catch (err2: any) {
      console.error(
        `Linear jitter retry strategy failed as well. Final error: ${err2.message}`
      );
      const subject = "Database Connection Failure";

      const message = `Both exponential backoff and linear jitter backoff retry strategies failed. Could not establish connection to the database. Error: ${err2.message}`;

      // await notificationHandler.notifyAdmin();
    }
  }
};

mongoose.connection.on("connecting", () => {
  console.log(`Attempting connection to database`);
});

mongoose.connection.on("connected", () => {
  console.log("Database connection successful");
});

mongoose.connection.on("disconnected", () => {
  console.error("Database connection failure");
});

mongoose.connection.on("reconnected", () => {
  console.log("Database reconnection successful");
});

export default Connection;
