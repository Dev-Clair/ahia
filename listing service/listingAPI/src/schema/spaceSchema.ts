import { Schema } from "mongoose";
import ISpace from "../interface/ISpace";
import PaymentOptionsSchema from "./paymentoptionsSchema";

const SpaceSchema: Schema<ISpace> = new Schema({
  spaceType: {
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
      return this.spaceType === "reservation" || this.spaceType === "sell";
    },
  },
  rental: {
    plan: {
      type: String,
      enum: ["monthly", "quarterly", "annually", "mixed"],
      required: function () {
        return this.spaceType === "lease";
      },
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
  },
  booking: {
    plan: {
      type: String,
      enum: ["daily", "extended", "mixed"],
      required: function () {
        return this.spaceType === "reservation";
      },
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
  },
  paymentOptions: [
    {
      type: PaymentOptionsSchema,
      required: function () {
        return this.spaceType === "sell";
      },
    },
  ],
});

export default SpaceSchema;
