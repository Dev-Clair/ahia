import { Schema } from "mongoose";
import TourRequestInterface from "../interface/tourRequestInterface";

const TourRequestSchema: Schema<TourRequestInterface> = new Schema({
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

export default TourRequestSchema;
