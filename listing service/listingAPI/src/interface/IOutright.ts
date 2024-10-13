export default interface IOutright {
  isNegotiable: boolean;
  amount: number;
  currency: string;
  discount?: number;
  termsAndConditions?: string[];
}
