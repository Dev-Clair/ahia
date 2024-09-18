import { Schema } from "mongoose";
import IIdempotency from "../interface/IIdempotency";

const IdempotencySchema: Schema<IIdempotency> = new Schema({
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
