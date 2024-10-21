import { Schema } from "mongoose";
import IOutright from "../interface/IOutright";

const OutrightSchema: Schema<IOutright> = new Schema(
  {
    isNegotiable: {
      type: Boolean,
      required: false,
    },
    price: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
      },
    },
    discount: {
      type: Number,
      required: false,
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
  },
  { _id: false, versionKey: false }
);

export default OutrightSchema;
