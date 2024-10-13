export default interface IInstalment {
  isNegotiable: boolean;
  plan: "short" | "medium" | "long";
  duration: number;
  downPayment: {
    amount: number;
    currency: string;
  };
  instalmentPayment: {
    amount: number;
    currency: string;
  };
  termsAndConditions?: string[];
}
