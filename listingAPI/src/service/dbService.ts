import mongoose from "mongoose";
import DbServiceError from "../error/dbserviceError";
import FailureRetry from "../utils/failureRetry";

/**
 * Database Service
 * @method connect
 * @method getConnection
 * @method Make
 */
class DbService {
  private connectionUri: string;

  constructor(connectionUri: string) {
    this.connectionUri = connectionUri;
  }

  /**
   * Establishes connection to the database
   * @private
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
   * Provides connection resource with round-robin retry strategy on failure
   * @public
   */
  public async getConnection(): Promise<void> {
    try {
      await FailureRetry.ExponentialBackoff(() => this.connect());
    } catch (err: any) {
      try {
        await FailureRetry.LinearJitterBackoff(() => this.connect());
      } catch (err: any) {
        throw new DbServiceError(
          err.message,
          "Retry strategies failed. Could not establish connection to the database."
        );
      }
    }
  }

  /**
   * Creates and returns a new instance of the DbService class
   * @param connectionUri
   * @returns DbService
   */
  public static Make(connectionUri: string): DbService {
    return new DbService(connectionUri);
  }
}

export default DbService;
