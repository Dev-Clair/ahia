import { Schema } from "mongoose";
import ISellOption from "../interface/ISelloption";

const SellOptionSchema: Schema<ISellOption> = new Schema({
  sellOption: {
    type: String,
    enum: ["outright", "instalment"],
    required: true,
  },
  outright: {
    price: {
      type: Number,
      required: function () {
        return this.sellOption === "outright";
      },
    },
    discount: {
      type: Number,
      required: false,
    },
  },
  instalment: {
    plan: {
      type: String,
      enum: ["short", "medium", "long"],
      required: function () {
        return this.sellOption === "instalment";
      },
    },
    duration: {
      type: Number,
      required: function () {
        return this.sellOption === "instalment";
      },
    },
    initialDeposit: {
      type: Number,
      required: function () {
        return this.sellOption === "instalment";
      },
    },
    instalmentAmount: {
      type: Number,
      required: function () {
        return this.sellOption === "instalment";
      },
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
  },
});

export default SellOptionSchema;
