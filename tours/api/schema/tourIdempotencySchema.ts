import { Schema } from "mongoose";
import TourIdempotencyInterface from "../interface/tourIdempotencyInterface";

const TourIdempotencySchema: Schema<TourIdempotencyInterface> = new Schema({
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

export default TourIdempotencySchema;
