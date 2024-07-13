const mongoose = require("mongoose");
const ConnectionError = require("./connectionError");
const Retry = require("./retry");

const establishConnection = async (connectionUri) => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 10000,
    });
  }
};

const Connection = async (connectionUri) => {
  try {
    await Retry.ExponentialBackoff(() => establishConnection(connectionUri));
  } catch (err) {
    try {
      await Retry.LinearJitterBackoff(() => establishConnection(connectionUri));
    } catch (err) {
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

module.exports = Connection;
