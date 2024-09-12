import mongoose from "mongoose";
import Idempotency from "../model/idempotencyModel";

/**
 * Handles Operation Idempotency
 */
class IdempotencyManager {
  /**
   * Verifies operation idempotency
   * @param key
   * @returns Promise<boolean>
   */
  static async Verify(key: string): Promise<boolean> {
    const verifyOperationIdempotency = await Idempotency.findOne({
      key: key,
    });

    if (verifyOperationIdempotency) {
      return true;
    }

    return false;
  }

  /**
   * Creates new idempotency key for an operation
   * @param string
   * @param session
   * @returns Promise<void>
   */
  static async Create(
    key: string,
    session: mongoose.ClientSession
  ): Promise<void> {
    await Idempotency.create(
      [
        {
          key: key,
        },
      ],
      { session: session }
    );
  }
}

export default IdempotencyManager;
