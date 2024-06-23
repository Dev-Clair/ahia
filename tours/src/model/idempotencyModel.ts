import mongoose from "mongoose";
import IdempotencySchema from "../schema/idempotencySchema";
import IdempotencyInterface from "../interface/idempotencyInterface";

const IdempotencyModel = mongoose.model<IdempotencyInterface>(
  "IdempotencyModel",
  IdempotencySchema
);

export default IdempotencyModel;
