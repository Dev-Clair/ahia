import mongoose from "mongoose";
import Idempotency from "../model/idempotencyModel";

/**
 * Ensures operation idempotency
 * @param req
 * @param res
 * @returns Promise<void>
 */
const EnsureIdempotency = async (
  key: string,
  session: mongoose.ClientSession
): Promise<void> => {
  await Idempotency.create(
    [
      {
        key: key,
      },
    ],
    { session: session }
  );
};

export default EnsureIdempotency;
