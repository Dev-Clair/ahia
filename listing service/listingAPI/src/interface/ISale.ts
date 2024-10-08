export default interface ISale {
  isNegotiable?: boolean;
  sale: "outright" | "instalment";
  outright: {
    price: {
      amount: number;
      currency: string;
    };
    discount?: number;
    termsAndConditions?: string[];
  };
  instalment: {
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
  };
}
