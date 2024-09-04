import ListingInterface from "./listingInterface";

export default interface SellInterface extends ListingInterface {
  isNegotiable: boolean;
  mortgage: {
    plan: "short" | "medium" | "long";
    available: boolean;
    termsAndConditions: string;
  };
}
