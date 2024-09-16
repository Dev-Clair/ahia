import IListing from "./IListing";

export default interface ILease extends IListing {
  isNegotiable: boolean;
  rental: {
    plan: "monthly" | "quarterly" | "annually" | "mixed";
    termsAndConditions?: string[];
  };
}
