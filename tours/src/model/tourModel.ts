import mongoose, { Schema } from "mongoose";
import TourInterface from "../interface/tourInterface";

const TourSchema: Schema<TourInterface> = new Schema({
  realtorId: {
    type: String,
    required: false,
  },
  customerId: {
    type: String,
    required: true,
  },
  listingIds: [
    {
      type: String,
      required: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Tour = mongoose.model<TourInterface>("Tour", TourSchema);

export default Tour;
