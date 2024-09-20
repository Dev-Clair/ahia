import { Document } from "mongoose";

export default interface IPaymentOptions extends Document {
  paymentOptionType: "outright" | "instalment";
  outright: {
    price?: number;
    discount?: number;
  };
  instalment: {
    plan?: "short" | "medium" | "long";
    duration?: number;
    initialDeposit?: number;
    instalmentAmount?: number;
    termsAndConditions?: string[];
  };
}
