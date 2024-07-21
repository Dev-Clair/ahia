import { Schema } from "mongoose";
import TourRealtorInterface from "../interface/tourRealtorInterface";

const TourRealtorSchema: Schema<TourRealtorInterface> = new Schema({
  tourId: {
    type: String,
    required: true,
  },
  realtor: {
    id: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default TourRealtorSchema;