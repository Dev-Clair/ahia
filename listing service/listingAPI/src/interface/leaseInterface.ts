import ListingInterface from "./listingInterface";

export default interface LeaseInterface extends ListingInterface {
  rental: {
    plan: "monthly" | "quarterly" | "annually";
    termsAndConditions: string;
  };
}
