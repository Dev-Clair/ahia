import IOffering from "./IOffering";

export default interface ILeaseOffering extends IOffering {
  lease: {
    isNegotiable?: boolean;
    plan: "monthly" | "quarterly" | "annually";
    termsAndConditions?: string[];
  };
  price: {
    amount: number;
    currency: string;
  };
}
