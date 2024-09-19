import IListing from "./IListing";

export default interface ISell extends IListing {
  isNegotiable: boolean;
  mortgage: {
    plan: "short" | "medium" | "long" | "flexible";
    duration: Date;
    initialDeposit: Number;
    termsAndConditions?: string[];
  };
}
