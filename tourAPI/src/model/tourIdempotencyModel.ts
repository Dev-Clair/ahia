import mongoose from "mongoose";
import TourIdempotencySchema from "../schema/tourIdempotencySchema";
import TourIdempotencyInterface from "../interface/tourIdempotencyInterface";

const TourIdempotency = mongoose.model<TourIdempotencyInterface>(
  "TourIdempotency",
  TourIdempotencySchema
);

export default TourIdempotency;
