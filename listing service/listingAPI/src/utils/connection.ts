import mongoose from "mongoose";
import ConnectionError from "../error/connectionError";
import FailureRetry from "./failureRetry";

class Connection {
  private connectionUri: string;

  constructor(connectionUri: string) {
    this.connectionUri = connectionUri;
  }

  /**
   * Provides connection resource with round-robin retry strategy on failure
   */
  public async Init(): Promise<void> {
    try {
      await FailureRetry.ExponentialBackoff(() => this.Connect());
    } catch (err: any) {
      try {
        await FailureRetry.LinearJitterBackoff(() => this.Connect());
      } catch (err: any) {
        throw new ConnectionError("DATABASE CONNECTION ERROR", err.message);
      }
    }
  }

  /**
   * Establishes connection to the database
   */
  private async Connect(): Promise<void> {
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
   * Creates and returns a new instance of the Connection class
   * @param connectionUri
   */
  public static Create(connectionUri: string): Connection {
    return new Connection(connectionUri);
  }
}

export default Connection;
