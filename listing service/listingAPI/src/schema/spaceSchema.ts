import { Schema } from "mongoose";
import ISpace from "../interface/ISpace";
import SellOptionSchema from "./selloptionSchema";

const SpaceSchema: Schema<ISpace> = new Schema({
  space: {
    type: String,
    enum: ["lease", "reservation", "sell"],
    required: true,
  },
  offerings: [
    {
      type: Schema.Types.ObjectId,
      ref: "Offering",
      required: false,
    },
  ],
  isNegotiable: {
    type: Boolean,
    required: function () {
      return this.space === "reservation" || this.space === "sell";
    },
  },
  lease: {
    plan: {
      type: String,
      enum: ["monthly", "quarterly", "annually", "mixed"],
      required: function () {
        return this.space === "lease";
      },
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
  },
  reservation: {
    plan: {
      type: String,
      enum: ["daily", "extended", "mixed"],
      required: function () {
        return this.space === "reservation";
      },
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
  },
  sell: [
    {
      type: SellOptionSchema,
      required: function () {
        return this.space === "sell";
      },
    },
  ],
});

export default SpaceSchema;
