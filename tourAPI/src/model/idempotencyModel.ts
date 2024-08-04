import mongoose from "mongoose";
import TourIdempotencySchema from "../schema/tourIdempotencySchema";
import TourIdempotencyInterface from "../interface/tourIdempotencyInterface";

const Idempotency = mongoose.model<TourIdempotencyInterface>(
  "Idempotency",
  TourIdempotencySchema
);

export default Idempotency;
