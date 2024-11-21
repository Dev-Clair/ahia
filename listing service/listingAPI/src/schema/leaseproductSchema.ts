import { Schema } from "mongoose";
import ILeaseProduct from "../interface/ILeaseproduct";
import LeaseSchema from "./leaseSchema";

const LeaseProductSchema: Schema<ILeaseProduct> = new Schema({
  lease: {
    type: [LeaseSchema],
    required: true,
  },
});

export default LeaseProductSchema;
