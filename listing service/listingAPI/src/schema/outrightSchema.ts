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
        required: [true, "price is required"],
      },
      currency: {
        type: String,
        required: [true, "currency is required"],
      },
    },
    discount: {
      type: Number,
      set: (value: number) => value / 100,
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
