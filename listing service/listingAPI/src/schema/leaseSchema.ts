import { Schema } from "mongoose";
import ILease from "../interface/ILease";

const LeaseSchema: Schema<ILease> = new Schema({
  isNegotiable: {
    type: Boolean,
    required: true,
  },
  rental: {
    plan: {
      type: String,
      enum: ["monthly", "quarterly", "annually", "mixed"],
      required: true,
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
  },
});

export default LeaseSchema;
