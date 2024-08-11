import Idempotency from "../model/idempotencyModel";

/**
 * Verifies operation idempotency
 * @param key
 * @returns Promise<boolean>
 */
const VerifyIdempotency = async (key: string): Promise<boolean> => {
  const verifyOperationIdempotency = await Idempotency.findOne({
    key: key,
  });

  if (verifyOperationIdempotency) {
    return true;
  }

  return false;
};

export default VerifyIdempotency;
