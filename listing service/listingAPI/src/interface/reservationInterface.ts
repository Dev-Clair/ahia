import ListingInterface from "./listingInterface";

export default interface ReservationInterface extends ListingInterface {
  booking: {
    plan: "daily" | "extended";
    termsAndConditions: string;
  };
}
