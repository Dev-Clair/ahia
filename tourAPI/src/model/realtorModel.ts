import mongoose from "mongoose";
import TourRealtorInterface from "../interface/tourRealtorInterface";
import TourRealtorSchema from "../schema/tourRealtorSchema";

const Realtor = mongoose.model<TourRealtorInterface>(
  "Realtor",
  TourRealtorSchema
);

export default Realtor;
