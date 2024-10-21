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

export default LeaseOfferingSchema;
