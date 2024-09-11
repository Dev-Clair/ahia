import { Schema } from "mongoose";
import SellInterface from "../interface/sellInterface";

const SellSchema: Schema<SellInterface> = new Schema({
  isNegotiable: {
    type: Boolean,
    required: true,
  },
  mortgage: {
    plan: {
      type: String,
      enum: ["short", "medium", "long"],
      required: true,
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
  },
});

export default SellSchema;
