import IOffering from "./IOffering";

export default interface ILeaseOffering extends IOffering {
  isNegotiable?: boolean;
  lease: {
    plan: "monthly" | "quarterly" | "annually";
    termsAndConditions?: string[];
  };
  price: {
    amount: number;
    currency: string;
  };
}
