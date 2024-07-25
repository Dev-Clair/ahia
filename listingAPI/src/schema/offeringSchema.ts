import { Schema } from "mongoose";
import OfferingInterface from "../interface/offeringInterface";

const OfferingSchema: Schema<OfferingInterface> = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  title: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  details: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default OfferingSchema;
