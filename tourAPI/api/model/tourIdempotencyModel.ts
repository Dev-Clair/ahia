import mongoose from "mongoose";
import TourIdempotencySchema from "../schema/tourIdempotencySchema";
import TourIdempotencyInterface from "../interface/tourIdempotencyInterface";

const TourIdempotencyModel = mongoose.model<TourIdempotencyInterface>(
  "TourIdempotencyModel",
  TourIdempotencySchema
);

export default TourIdempotencyModel;
