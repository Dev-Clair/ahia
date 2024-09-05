import { Schema } from "mongoose";
import LeaseInterface from "../interface/leaseInterface";

const LeaseSchema: Schema<LeaseInterface> = new Schema({
  isNegotiable: {
    type: Boolean,
    required: true,
  },
  rental: {
    plan: {
      type: [String],
      enum: ["monthly", "quarterly", "annually"],
      required: true,
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
  },
});

export default LeaseSchema;
