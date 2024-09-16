import { Schema } from "mongoose";
import ISell from "../interface/ISell";

const SellSchema: Schema<ISell> = new Schema({
  isNegotiable: {
    type: Boolean,
    required: true,
  },
  mortgage: {
    plan: {
      type: String,
      enum: ["short", "medium", "long", "mixed"],
      required: true,
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
  },
});

export default SellSchema;
