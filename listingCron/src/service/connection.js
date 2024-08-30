const mongoose = require("mongoose");
const ConnectionError = require("../error/connectionError");
const Retry = require("../utils/retry");

/**
 * Connection
 * @method connect
 * @method getConnection
 * @method Create
 */
class Connection {
  connectionUri;

  constructor(connectionUri) {
    this.connectionUri = connectionUri;
  }

  /**
   * Establishes connection to the database
   * @private
   */
  async connect() {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(this.connectionUri, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 120,
        minPoolSize: 20,
        socketTimeoutMS: 60000,
      });
    }
  }

  /**
   * Provides connection resource with round-robin retry strategy on failure
   * @public
   */
  async getConnection() {
    try {
      await Retry.ExponentialBackoff(() => this.connect());
    } catch (err) {
      try {
        await Retry.LinearJitterBackoff(() => this.connect());
      } catch (err) {
        throw new ConnectionError(
          err.message,
          "Retry strategies failed. Could not establish connection to the database."
        );
      }
    }
  }

  /**
   * Creates and returns a new instance of the Connection class
   * @param connectionUri
   * @returns Connection
   */
  static Create(connectionUri) {
    return new Connection(connectionUri);
  }
}

export default Connection;
