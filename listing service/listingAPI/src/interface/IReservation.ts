import IListing from "./IListing";

export default interface IReservation extends IListing {
  booking: {
    plan: "daily" | "extended" | "mixed";
    termsAndConditions?: string;
  };
}
