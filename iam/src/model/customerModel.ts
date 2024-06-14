import mongoose from "mongoose";
import IAM from "./iamModel";

const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  bookedTours: [
    {
      tourId: {
        type: String,
        trim: true,
        required: true,
      },
      listingIds: [
        {
          type: String,
          trim: true,
          required: true,
        },
      ],
      zone: {
        type: String,
        trim: true,
        required: true,
      },
      countyLGA: {
        type: String,
        trim: true,
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
        trim: true,
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
});

const Customer = IAM.discriminator("Customer", CustomerSchema);

export default Customer;
