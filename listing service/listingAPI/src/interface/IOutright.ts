export default interface IOutright {
  isNegotiable: boolean;
  price: {
    amount: number;
    currency: string;
  };
  discount?: number;
  termsAndConditions?: string[];
}
