const mongoose = require("mongoose");

let currentRetries = 0;

let retryDelay = 5000;

const maxRetries = 5;

const Connection = async (connectionUri) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionUri, {
        serverSelectionTimeoutMS: 10000,
      });
    }
  } catch (err) {
    if (currentRetries < maxRetries) {
      console.log(`Attempting reconnection to database`);

      currentRetries++;

      retryDelay *= 2;

      setTimeout(() => Connection(connectionUri), retryDelay);
    } else {
      console.log(
        `Database connection error\nMax retries reached, Could not establish connection to database:\n${err.message}`
      );
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

module.exports = Connection;
