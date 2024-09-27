import { Schema } from "mongoose";
import ILeaseOffering from "../interface/ILeaseoffering";
import RentSchema from "./rentSchema";

const LeaseOfferingSchema: Schema<ILeaseOffering> = new Schema({
  lease: {
    type: [RentSchema],
    required: true,
  },
});

export default LeaseOfferingSchema;
