import mongoose from "mongoose";
import IAM from "./iamModel";

const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
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
  passwordHash: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  cart: [
    {
      listingId: {
        type: String,
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  bookedTours: [
    {
      tourId: {
        type: String,
        required: true,
      },
      listingIds: [
        {
          type: String,
          required: true,
        },
      ],
      zone: {
        type: String,
        required: true,
      },
      countyLGA: {
        type: String,
        required: true,
      },
      scheduledDate: {
        type: Date,
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending",
      },
    },
  ],
  paymentHistory: [
    {
      paymentId: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: ["successful", "failed"],
        required: true,
      },
      paymentDate: {
        type: Date,
        default: Date.now,
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

module.exports = mongoose.model("Customer", CustomerSchema);
