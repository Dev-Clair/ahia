export default interface ILease {
  isNegotiable?: boolean;
  plan: "monthly" | "quarterly" | "annually";
  price: {
    amount: number;
    currency: string;
  };
  termsAndConditions?: string[];
}
