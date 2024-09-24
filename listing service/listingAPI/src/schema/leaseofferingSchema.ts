import { Schema } from "mongoose";
import ILeaseOffering from "../interface/ILeaseOffering";

const LeaseOfferingSchema: Schema<ILeaseOffering> = new Schema(
  {
    isNegotiable: {
      type: Boolean,
      required: false,
    },
    lease: {
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
  },
  { _id: false, versionKey: false }
);

export default LeaseOfferingSchema;
