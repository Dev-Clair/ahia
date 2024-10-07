import { Schema } from "mongoose";
import ILeaseOffering from "../interface/ILeaseoffering";
import LeaseSchema from "./leaseSchema";

const LeaseOfferingSchema: Schema<ILeaseOffering> = new Schema({
  status: {
    type: String,
    enum: ["now-letting", "closed"],
    default: "now-letting",
  },
  lease: {
    type: [LeaseSchema],
    required: true,
  },
});

// LeaseOffering Schema Search Query Index
LeaseOfferingSchema.index({ status: "text" });

export default LeaseOfferingSchema;
