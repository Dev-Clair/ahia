import { Document, ObjectId } from "mongoose";
import IPromotion from "./IPromotion";
import OfferingInterface from "./offeringInterface";
import ListingInterface from "./listingInterface";

export default interface PromotionInterface extends IPromotion, Document {
  fetchListingss: () => Promise<ListingInterface[]>;
  addListing: (listingId: ObjectId) => Promise<void>;
  removeListing: (listingId: ObjectId) => Promise<void>;
  fetchOfferings: () => Promise<OfferingInterface[]>;
  addOffering: (offeringId: ObjectId) => Promise<void>;
  removeOffering: (offeringId: ObjectId) => Promise<void>;
  checkPromotionValidity: (date: Date) => boolean;
  reactivatePromotion: (startDate: Date, endDate: Date) => Promise<void>;
}
