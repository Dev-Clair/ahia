export default interface ISale {
  sale: "outright" | "instalment";
  outright: {
    price: {
      amount: number;
      currency: string;
    };
    discount?: number;
  };
  instalment: {
    plan: "short" | "medium" | "long";
    duration: number;
    initialDeposit: number;
    instalmentAmount: number;
    termsAndConditions?: string[];
  };
}
