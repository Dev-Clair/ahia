import { Schema } from "mongoose";
import IdempotencyInterface from "../interface/IIdempotency";

const IdempotencySchema: Schema<IdempotencyInterface> = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "24h",
  },
});

export default IdempotencySchema;
