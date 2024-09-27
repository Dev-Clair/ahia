export default interface IReservation {
  plan: "daily" | "extended";
  price: {
    amount: number;
    currency: string;
  };
  termsAndConditions?: string;
}
