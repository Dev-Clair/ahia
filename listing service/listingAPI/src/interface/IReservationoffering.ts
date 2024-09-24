import IOffering from "./IOffering";

export default interface IReservationOffering extends IOffering {
  reservation: {
    plan: "daily" | "extended";
    termsAndConditions?: string;
  };
  price: {
    amount: number;
    currency: string;
  };
}
