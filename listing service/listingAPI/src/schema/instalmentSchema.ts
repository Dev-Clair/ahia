import { Schema } from "mongoose";
import IInstalment from "../interface/IInstalment";

const InstalmentSchema: Schema<IInstalment> = new Schema(
  {
    isNegotiable: {
      type: Boolean,
      required: false,
    },
    plan: {
      type: String,
      enum: ["short", "medium", "long"],
      required: [true, "invalid instalment plan"],
    },
    duration: {
      type: Number,
      required: [true, "duration is required"],
    },
    downPayment: {
      amount: {
        type: Number,
        required: [true, "downPayment is required"],
      },
      currency: {
        type: String,
        required: [true, "currency is required"],
      },
    },
    instalmentPayment: {
      amount: {
        type: Number,
        required: [true, "instalmentPayment is required"],
      },
      currency: {
        type: String,
        required: [true, "currency is required"],
      },
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
  },
  { _id: false, versionKey: false }
);

export default InstalmentSchema;
