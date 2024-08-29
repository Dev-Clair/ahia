import mongoose from "mongoose";
import DatabaseServiceError from "../error/databaseserviceError";
import FailureRetry from "../utils/failureRetry";

/**
 * Database Service
 * @method connect
 * @method getConnection
 * @method Create
 */
class DatabaseService {
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
        throw new DatabaseServiceError(
          err.message,
          "Retry strategies failed. Could not establish connection to the database."
        );
      }
    }
  }

  /**
   * Creates and returns a new instance of the DatabaseService class
   * @param connectionUri
   * @returns DatabaseService
   */
  public static Create(connectionUri: string): DatabaseService {
    return new DatabaseService(connectionUri);
  }
}

export default DatabaseService;
