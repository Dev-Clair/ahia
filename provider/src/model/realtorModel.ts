import mongoose from "mongoose";
import IAM from "./iamModel";

const Schema = mongoose.Schema;

const RealtorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["in_waiting", "available", "booked"],
    default: "in_waiting",
  },
  location: {
    type: String,
    required: true,
  },
  assignedTours: [
    {
      tourId: {
        type: String,
        required: true,
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
        required: true,
      },
      status: {
        type: String,
        enum: ["scheduled", "completed"],
        default: "scheduled",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Realtor", RealtorSchema);
