import { Schema } from "mongoose";
import IPaymentOptions from "./IPaymentoptions";

export default interface ISpace {
  spaceType: "lease" | "sell" | "reservation";
  offerings: Schema.Types.ObjectId[];
  isNegotiable?: boolean;
  rental: {
    plan?: "monthly" | "quarterly" | "annually" | "mixed";
    termsAndConditions?: string[];
  };
  booking: {
    plan?: "daily" | "extended";
    termsAndConditions?: string;
  };
  paymentOptions?: [IPaymentOptions];
}
