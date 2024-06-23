import { Schema } from "mongoose";
import IdempotencyInterface from "../interface/idempotencyInterface";

const IdempotencySchema: Schema<IdempotencyInterface> = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  response: {
    type: Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "24h",
  },
});

export default IdempotencySchema;
