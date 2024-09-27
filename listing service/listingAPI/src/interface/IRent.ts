export default interface IRent {
  isNegotiable?: boolean;
  plan: "monthly" | "quarterly" | "annually";
  price: {
    amount: number;
    currency: string;
  };
  termsAndConditions?: string[];
}
