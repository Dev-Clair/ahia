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
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    downPayment: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
      },
    },
    instalmentPayment: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
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
