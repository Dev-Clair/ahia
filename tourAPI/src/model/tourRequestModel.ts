import mongoose from "mongoose";
import TourRequestInterface from "../interface/tourRequestInterface";
import TourRequestSchema from "../schema/tourRequestSchema";

const TourRequest = mongoose.model<TourRequestInterface>(
  "TourRequest",
  TourRequestSchema
);

export default TourRequest;
