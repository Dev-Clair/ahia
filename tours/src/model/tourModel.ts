import mongoose, { Schema } from "mongoose";
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
      type: String,
      required: [true, "A new tour must have a a collection of listings"],
    },
  ],
  scheduledDate: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
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

const Tour = mongoose.model<TourInterface>("Tour", TourSchema);

export default Tour;
