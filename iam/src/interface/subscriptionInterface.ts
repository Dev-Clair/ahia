import { Document, Schema } from "mongoose";

export default interface SubscriptionInterface extends Document {
  provider: Schema.Types.ObjectId[];
  customer: Schema.Types.ObjectId[];
  notification: {
    preference: "email" | "sms" | "push";
    frequency: "regular" | "interval";
  };
  createdAt: Date;
}
