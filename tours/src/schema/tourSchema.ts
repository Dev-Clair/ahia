import { Schema } from "mongoose";
import TourInterface from "../interface/tourInterface";

const TourSchema: Schema<TourInterface> = new Schema({
  realtorId: {
    type: String,
    required: false,
  },
  customerId: {
    type: String,
    required: [true, "A new tour must have a customerId"],
  },
  listingIds: [
    {
      type: [String],
      required: [true, "A new tour must have a a collection of listings"],
    },
  ],
  scheduledDate: {
    type: Date,
    required: false,
  },
  scheduledTime: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["pending", "ongoing", "completed", "cancelled"],
    default: "pending",
  },
  isClosed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default TourSchema;
