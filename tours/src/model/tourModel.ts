import mongoose, { Schema } from "mongoose";
import TourInterface from "../interface/tourInterface";

const TourSchema: Schema<TourInterface> = new Schema({
  realtorId: {
    type: String,
    required: false,
  },
  customerId: {
    type: String,
    required: false,
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

module.exports = mongoose.model<TourInterface>("Tour", TourSchema);
