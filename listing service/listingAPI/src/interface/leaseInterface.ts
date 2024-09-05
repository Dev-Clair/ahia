import ListingInterface from "./listingInterface";

export default interface LeaseInterface extends ListingInterface {
  isNegotiable: boolean;
  rental: {
    plan: "monthly" | "quarterly" | "annually";
    termsAndConditions: string[];
  };
}
