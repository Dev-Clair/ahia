import mongoose from "mongoose";
import DatabaseServiceError from "../error/connectionserviceError";
import FailureRetry from "../utils/failureRetry";

/**
 * Connection Service
 * @method connect
 * @method getConnection
 */
class ConnectionService {
  private connectionUri: string;

  constructor(connectionUri: string) {
    this.connectionUri = connectionUri;
  }

  /**
   * Provides connection resource with round-robin retry strategy on failure
   * @public
   */
  async getConnection(): Promise<void> {
    try {
      await FailureRetry.ExponentialBackoff(() => this.connect());
    } catch (err: any) {
      try {
        await FailureRetry.LinearJitterBackoff(() => this.connect());
      } catch (err: any) {
        throw new DatabaseServiceError(
          err.message,
          "Retry strategies failed. Could not establish connection to the database."
        );
      }
    }
  }

  /**
   * Establishes connection to the database
   */
  private async connect(): Promise<void> {
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
   * Creates and returns a new instance of the ConnectionService class
   * @param connectionUri
   */
  public static Create(connectionUri: string): ConnectionService {
    return new ConnectionService(connectionUri);
  }
}

export default ConnectionService;
