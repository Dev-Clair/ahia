import mongoose from "mongoose";
import TourRealtorInterface from "../interface/tourRealtorInterface";
import TourRealtorSchema from "../schema/tourRealtorSchema";

const TourRealtor = mongoose.model<TourRealtorInterface>(
  "TourRealtor",
  TourRealtorSchema
);

export default TourRealtor;
