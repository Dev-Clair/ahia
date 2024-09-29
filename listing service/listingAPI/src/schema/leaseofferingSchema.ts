import { Schema } from "mongoose";
import ILeaseOffering from "../interface/ILeaseoffering";
import LeaseSchema from "./leaseSchema";

const LeaseOfferingSchema: Schema<ILeaseOffering> = new Schema({
  lease: {
    type: [LeaseSchema],
    required: true,
  },
});

export default LeaseOfferingSchema;
