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
      required: [true, "invalid lease plan"],
    },
    price: {
      amount: {
        type: Number,
        required: [true, "price is required"],
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

export default LeaseSchema;
