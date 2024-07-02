import mongoose from "mongoose";
import RetryHandler from "./src/utils/retryHandler/retryHandler";
import NotifyUser from "./src/utils/notificationHandler/notificationHandler";

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
    await RetryHandler.ExponentialRetry(() =>
      establishConnection(connectionUri)
    );
  } catch (err: any) {
    try {
      await RetryHandler.LinearJitterRetry(() =>
        establishConnection(connectionUri)
      );
    } catch (err: any) {
      const from: string = process.env.TOUR_ADMIN_EMAIL || "";

      const to: [string] = [""];

      const subject: string = "Database Connection Failure";

      const message: string = `Backoff retry strategies failed. Could not establish connection to the database.\nError: ${err.message}`;

      await NotifyUser(from, to, subject, message); // Admin

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
