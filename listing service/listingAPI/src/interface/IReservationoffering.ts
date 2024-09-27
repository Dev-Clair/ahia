import IOffering from "./IOffering";

export default interface IReservationOffering extends IOffering {
  reservation: {
    plan: "daily" | "extended";
    price: {
      amount: number;
      currency: string;
    };
    termsAndConditions?: string;
  };
}
