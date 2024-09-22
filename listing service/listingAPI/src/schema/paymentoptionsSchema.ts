import { Schema } from "mongoose";
import IPaymentOptions from "../interface/IPaymentoptions";

const PaymentOptionsSchema: Schema<IPaymentOptions> = new Schema({
  paymentOptionType: {
    type: String,
    enum: ["outright", "instalment"],
    required: true,
  },
  outright: {
    price: {
      type: Number,
      required: function () {
        return this.paymentOptionType === "outright";
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
        return this.paymentOptionType === "instalment";
      },
    },
    duration: {
      type: Number,
      required: function () {
        return this.paymentOptionType === "instalment";
      },
    },
    initialDeposit: {
      type: Number,
      required: function () {
        return this.paymentOptionType === "instalment";
      },
    },
    instalmentAmount: {
      type: Number,
      required: function () {
        return this.paymentOptionType === "instalment";
      },
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
  },
});

export default PaymentOptionsSchema;
