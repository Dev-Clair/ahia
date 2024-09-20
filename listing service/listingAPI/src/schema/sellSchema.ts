import { Schema } from "mongoose";
import ISell from "../interface/ISell";
import PaymentOptionsSchema from "./paymentoptionsSchema";

const SellSchema: Schema<ISell> = new Schema({
  isNegotiable: {
    type: Boolean,
    required: true,
  },
  paymentOptions: [
    {
      type: PaymentOptionsSchema,
      required: true,
    },
  ],
});

export default SellSchema;
