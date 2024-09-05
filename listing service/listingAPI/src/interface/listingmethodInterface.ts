import ListingInterface from "./listingInterface";
import OfferingInterface from "./offeringInterface";

export default interface ListingMethodInterface extends ListingInterface {
  fetchOfferings: () => Promise<OfferingInterface[]>;
}
