import { Schema } from "mongoose";
import TourInterface from "../interface/tourInterface";

const TourSchema: Schema<TourInterface> = new Schema({
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
  customer: {
    id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  listingIds: [
    {
      type: [String],
      required: true,
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

TourSchema.index({
  "customer.id": "text",
  "realtor.id": "text",
  "customer.email": "text",
  "realtor.email": "text",
});

export default TourSchema;
