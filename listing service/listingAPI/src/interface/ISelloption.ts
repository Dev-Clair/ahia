export default interface ISellOption {
  sellOption: "outright" | "instalment";
  outright: {
    price?: number;
    discount?: number;
  };
  instalment: {
    plan?: "short" | "medium" | "long";
    duration?: number;
    initialDeposit?: number;
    instalmentAmount?: number;
    termsAndConditions?: string[];
  };
}
