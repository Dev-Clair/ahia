import mongoose from "mongoose";
import Idempotency from "../model/idempotencyModel";

/**
 * Stores idempotency key
 * @param req
 * @param res
 * @returns Promise<void>
 */
const StoreIdempotencyKey = async (
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

export default StoreIdempotencyKey;
