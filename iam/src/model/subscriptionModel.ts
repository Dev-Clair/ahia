import mongoose from "mongoose";
import SubscriptionSchema from "../schema/subscriptionSchema";
import SubscriptionInterface from "../interface/subscriptionInterface";

const Subscription = mongoose.model<SubscriptionInterface>(
  "Subscription",
  SubscriptionSchema
);

export default Subscription;
