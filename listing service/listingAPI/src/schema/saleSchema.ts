import { Schema } from "mongoose";
import ISale from "../interface/ISale";

const SaleSchema: Schema<ISale> = new Schema(
  {
    sale: {
      type: String,
      enum: ["outright", "instalment"],
      required: true,
    },
    outright: {
      price: {
        amount: {
          type: Number,
          required: function () {
            return this.sale === "outright";
          },
        },
        currency: {
          type: String,
          required: function () {
            return this.sale === "outright";
          },
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
          return this.sale === "instalment";
        },
      },
      duration: {
        type: Number,
        required: function () {
          return this.sale === "instalment";
        },
      },
      initialDeposit: {
        type: Number,
        required: function () {
          return this.sale === "instalment";
        },
      },
      instalmentAmount: {
        type: Number,
        required: function () {
          return this.sale === "instalment";
        },
      },
      termsAndConditions: {
        type: [String],
        required: false,
      },
    },
  },
  { _id: false, versionKey: false }
);

export default SaleSchema;
