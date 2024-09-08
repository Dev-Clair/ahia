import { Schema } from "mongoose";
import OfferingInterface from "../interface/offeringInterface";

const baseStoragePath = `https://s3.amazonaws.com/af-south-1/ahia-listing-offering`;

const OfferingSchema: Schema<OfferingInterface> = new Schema({
  name: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  features: [
    {
      type: String,
      required: true,
    },
  ],
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
  media: {
    picture: {
      type: [String],
      get: (values: string[]) =>
        values.map((value) => `${baseStoragePath}${value}`),
      required: false,
    },
    video: {
      type: [String],
      get: (values: string[]) =>
        values.map((value) => `${baseStoragePath}${value}`),
      required: false,
    },
  },
});

// Offering Schema Search Query Index
OfferingSchema.index({ name: "text", type: "text" });

export default OfferingSchema;
