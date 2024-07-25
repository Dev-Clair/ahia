import { Schema } from "mongoose";
import SubscriptionInterface from "../interface/subscriptionInterface";

const SubscriptionSchema: Schema<SubscriptionInterface> = new Schema({
  provider: [
    {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
  ],
  customer: [
    {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
  ],
  notification: {
    preference: {
      type: String,
      enum: ["email", "sms", "push"],
      default: "email",
      required: true,
    },
    frequency: {
      type: String,
      enum: ["regular", "interval"],
      default: "regular",
      required: false,
    },
  },
});

export default SubscriptionSchema;
