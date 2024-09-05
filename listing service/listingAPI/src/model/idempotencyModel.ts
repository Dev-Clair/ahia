import { model } from "mongoose";
import IdempotencySchema from "../schema/idempotencySchema";
import IdempotencyInterface from "../interface/idempotencyInterface";

const Idempotency = model<IdempotencyInterface>(
  "Idempotency",
  IdempotencySchema
);

export default Idempotency;
