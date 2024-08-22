import mongoose from "mongoose";
import DbServiceError from "../error/dbserviceError";
import FailureRetry from "../utils/failureRetry";

class DbService {
  /**
   * Establishes connection to database
   * @param connectionUri
   */
  static async Connect(connectionUri: string): Promise<void> {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionUri, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 120,
        minPoolSize: 20,
        socketTimeoutMS: 60000,
      });
    }
  }

  /**
   * Provides connection resource with round robin retry strategy on failure
   * @param connectionUri
   */
  static async Connection(connectionUri: string): Promise<void> {
    try {
      await FailureRetry.ExponentialBackoff(() => this.Connect(connectionUri));
    } catch (err: any) {
      try {
        await FailureRetry.LinearJitterBackoff(() =>
          this.Connect(connectionUri)
        );
      } catch (err: any) {
        throw new DbServiceError(
          err.message,
          "Retry strategies failed. Could not establish connection to the database"
        );
      }
    }
  }
}

export default DbService;
