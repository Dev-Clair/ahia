import { Schema } from "mongoose";
import CustomerInterface from "../interface/customerInterface";

const CustomerSchema: Schema<CustomerInterface> = new Schema({
  tours: [
    {
      type: String,
      trim: true,
      required: false,
    },
  ],
  payments: [
    {
      type: String,
      trim: true,
      required: false,
    },
  ],
  subscription: [
    {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: false,
    },
  ],
});

export default CustomerSchema;
