import mongoose from "mongoose";
import IdempotencySchema from "../schema/idempotencySchema";
import IIdempotency from "../interface/IIdempotency";

const Idempotency = mongoose.model<IIdempotency>(
  "Idempotency",
  IdempotencySchema
);

export default Idempotency;
