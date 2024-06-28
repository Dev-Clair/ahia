import mongoose from "mongoose";
import retryHandler from "./api/utils/retryHandler/retryHandler";
import notificationHandler from "./api/utils/notificationHandler/notificationHandler";

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
    await retryHandler.ExponentialRetry(() =>
      establishConnection(connectionUri)
    );
  } catch (err: any) {
    try {
      await retryHandler.LinearJitterRetry(() =>
        establishConnection(connectionUri)
      );
    } catch (err: any) {
      const subject = "Database Connection Failure";

      const message = `Backoff retry strategies failed. Could not establish connection to the database. Error: ${err.message}`;

      await notificationHandler.notifyAdmin(subject, message, [""]);

      process.kill(process.pid, "SIGTERM");
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
