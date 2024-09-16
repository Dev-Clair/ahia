import IListing from "./IListing";

export default interface ISell extends IListing {
  isNegotiable: boolean;
  mortgage: {
    plan: "short" | "medium" | "long" | "mixed";
    termsAndConditions?: string[];
  };
}
