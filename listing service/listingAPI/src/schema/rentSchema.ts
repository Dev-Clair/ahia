import { Schema } from "mongoose";
import IRent from "../interface/IRent";

const RentSchema: Schema<IRent> = new Schema(
  {
    isNegotiable: {
      type: Boolean,
      required: false,
    },
    plan: {
      type: String,
      enum: ["monthly", "quarterly", "annually"],
      required: true,
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
    termsAndConditions: {
      type: [String],
      required: false,
    },
  },
  { _id: false, versionKey: false }
);

export default RentSchema;
