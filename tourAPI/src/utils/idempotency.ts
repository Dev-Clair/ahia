import mongoose from "mongoose";
import Idempotency from "../model/idempotencyModel";

class Idempotent {
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
   * Ensures operation idempotency
   * @param req
   * @param res
   * @returns Promise<void>
   */
  static async Ensure(
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

export default Idempotent;