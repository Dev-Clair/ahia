import { Schema } from "mongoose";
import ISellOption from "./ISelloption";

export default interface ISpace {
  space: "lease" | "sell" | "reservation";
  offerings?: Schema.Types.ObjectId[];
  isNegotiable?: boolean;
  lease: {
    plan?: "monthly" | "quarterly" | "annually" | "mixed";
    termsAndConditions?: string[];
  };
  reservation: {
    plan?: "daily" | "extended";
    termsAndConditions?: string;
  };
  sell?: [ISellOption];
}
