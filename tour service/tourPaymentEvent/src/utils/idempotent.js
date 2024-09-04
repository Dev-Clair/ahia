const Idempotency = require("../model/idempotency");

/**
 * Handles Operation Idempotency
 */
class Idempotent {
  /**
   * Verifies idempotency
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
   * Ensures idempotency
   * @param string
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
