import mongoose from "mongoose";
import IdempotencySchema from "../schema/idempotency";
import IdempotencyInterface from "../interface/idempotency";

const Idempotency = mongoose.model<IdempotencyInterface>(
  "Idempotency",
  IdempotencySchema
);

export default Idempotency;
