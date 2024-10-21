import { Schema } from "mongoose";
import IOffering from "../interface/IOffering";
import Offerings from "../constant/offerings";

const OfferingSchema: Schema<IOffering> = new Schema(
  {
    name: {
      type: String,
      enum: Object.keys(Offerings).flat(),
      required: true,
    },
    category: {
      type: String,
      enum: ["economy", "premium", "luxury"],
      required: true,
    },
    features: {
      type: [String],
      required: true,
    },
    area: {
      size: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["sqm", "sqft"],
        required: true,
      },
    },
    quantity: {
      type: Number,
      default: 1,
    },
    type: {
      type: String,
      enum: Object.values(Offerings).flat(),
      required: true,
    },
  },
  { _id: false, versionKey: false }
);

// Offering Schema Middleware
OfferingSchema.pre("validate", function (next) {
  const names = Offerings[this.name];

  if (!names.includes(this.type))
    throw new Error(`Invalid type option for offering name: ${this.name}`);

  next();
});

export default OfferingSchema;
