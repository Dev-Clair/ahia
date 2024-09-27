import { Schema } from "mongoose";
import ILease from "../interface/ILease";

const LeaseSchema: Schema<ILease> = new Schema(
  {
    isNegotiable: {
      type: Boolean,
      required: false,
    },
    plan: {
      type: String,
      enum: ["monthly", "quarterly", "annually"],
      required: true,
    },
    price: {
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

export default LeaseSchema;
