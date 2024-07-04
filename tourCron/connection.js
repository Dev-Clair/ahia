const mongoose = require("mongoose");
const RetryHandler = require("./retryHandler");
const NotifyAdmin = require("./notificationHandler");

const establishConnection = async (connectionUri) => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 10000,
    });
  }
};

const Connection = async (connectionUri) => {
  try {
    await RetryHandler.ExponentialRetry(() =>
      establishConnection(connectionUri)
    );
  } catch (err) {
    try {
      await RetryHandler.LinearJitterRetry(() =>
        establishConnection(connectionUri)
      );
    } catch (err) {
      const from = process.env.TOUR_ADMIN_EMAIL_I || "";

      const to = [process.env.TOUR_ADMIN_EMAIL_II || ""];

      const subject = "Database Connection Failure";

      const message = `Backoff retry strategies failed. Could not establish connection to the database.\nError: ${err.message}`;

      await NotifyAdmin(from, to, subject, message);

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

module.exports = Connection;
