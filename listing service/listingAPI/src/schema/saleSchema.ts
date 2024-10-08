import { Schema } from "mongoose";
import ISale from "../interface/ISale";

const SaleSchema: Schema<ISale> = new Schema(
  {
    isNegotiable: {
      type: Boolean,
      required: false,
    },
    sale: {
      type: String,
      enum: ["outright", "instalment"],
      required: true,
    },
    outright: {
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
      discount: {
        type: Number,
        required: false,
      },
      termsAndConditions: {
        type: [String],
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
      downPayment: {
        amount: {
          type: Number,
          required: function () {
            return this.sale === "instalment";
          },
        },
        currency: {
          type: String,
          required: function () {
            return this.sale === "instalment";
          },
        },
      },
      instalmentPayment: {
        amount: {
          type: Number,
          required: function () {
            return this.sale === "instalment";
          },
        },
        currency: {
          type: String,
          required: function () {
            return this.sale === "instalment";
          },
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
