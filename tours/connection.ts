import mongoose from "mongoose";
import pRetry from "p-retry";
import asyncRetry from "async-retry";
import failureRetryHandler from "./api/utils/failureRetryHandler/failureRetryHandler";

const establishConnection = async (connectionUri: string): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 10000,
    });
  }
};

// const exponentialRetry = async (connectionUri: string) => {
//   await pRetry(
//     async () => {
//       await establishConnection(connectionUri);
//     },
//     {
//       retries: 5,
//       factor: 2,
//       minTimeout: 5000,
//       onFailedAttempt: (err) => {
//         console.error(
//           `Exponential retry attempt ${err.attemptNumber} failed. There are ${err.retriesLeft} retries left. Error: ${err.message}`
//         );
//       },
//     }
//   );
// };

// const linearJitterRetry = async (connectionUri: string) => {
//   await asyncRetry(
//     async () => {
//       await establishConnection(connectionUri);
//     },
//     {
//       retries: 5,
//       minTimeout: 5000,
//       onRetry: (err, attempt) => {
//         const jitter = Math.random() * 1000;

//         console.error(
//           `Linear jitter retry attempt ${attempt} failed. Error: ${
//             err.message
//           }. Next retry in ${5000 + jitter}ms`
//         );
//         return 5000 + jitter;
//       },
//     }
//   );
// };

const Connection = async (
  connectionUri: string
): Promise<void | typeof import("mongoose")> => {
  try {
    // await exponentialRetry(connectionUri);
    failureRetryHandler.exponentialRetry(establishConnection(connectionUri));
  } catch (err1: any) {
    console.log(
      `Exponential retry strategy failed, switching to linear jitter backoff. Error: ${err1.message}`
    );
    try {
      // await linearJitterRetry(connectionUri);
      failureRetryHandler.linearJitterRetry(establishConnection(connectionUri));
    } catch (err2: any) {
      console.log(
        `Linear jitter retry strategy failed as well. Final error: ${err2.message}`
      );
      // await notifyAdmin('Database Connection Failure', `Both exponential backoff and linear jitter backoff retry strategies failed. Could not establish connection to the database. Error: ${err2.message}`);
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
  console.log("Database connection failure");
});

mongoose.connection.on("reconnected", () => {
  console.log("Database reconnection successful");
});

export default Connection;
