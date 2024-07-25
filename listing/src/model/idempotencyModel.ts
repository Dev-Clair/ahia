import mongoose from "mongoose";
import IdempotencySchema from "../schema/idempotencySchema";
import IdempotencyInterface from "../interface/idempotencyInterface";

const Idempotency = mongoose.model<IdempotencyInterface>(
  "Idempotency",
  IdempotencySchema
);

export default Idempotency;
