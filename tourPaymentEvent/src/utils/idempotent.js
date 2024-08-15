const Idempotency = require("../model/idempotencyModel");

class Idempotent {
  /**
   * Verifies operation idempotency
   * @param key
   * @returns Promise<boolean>
   */
  static async Verify(key) {
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
   * @param key
   * @param session
   * @returns Promise<void>
   */
  static async Ensure(key, session) {
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
