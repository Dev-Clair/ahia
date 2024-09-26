import { Schema } from "mongoose";
import ILeaseOffering from "../interface/ILeaseoffering";

const LeaseOfferingSchema: Schema<ILeaseOffering> = new Schema({
  lease: {
    isNegotiable: {
      type: Boolean,
      required: false,
    },
    plan: {
      type: String,
      enum: ["monthly", "quarterly", "annually"],
      required: true,
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
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
});

export default LeaseOfferingSchema;
