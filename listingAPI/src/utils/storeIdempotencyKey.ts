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
  response: any,
  session: mongoose.ClientSession
): Promise<void> => {
  await Idempotency.create(
    [
      {
        key: key,
        response: response,
      },
    ],
    { session }
  );
};

export default StoreIdempotencyKey;
