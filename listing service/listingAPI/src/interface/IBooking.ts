export default interface IBooking {
  plan: "daily" | "extended";
  price: {
    amount: number;
    currency: string;
  };
  termsAndConditions?: string;
}
