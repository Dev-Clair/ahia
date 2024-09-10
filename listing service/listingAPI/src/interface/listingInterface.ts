import { Document } from "mongoose";
import IListing from "./IListing";
import OfferingInterface from "./offeringInterface";

export default interface ListingInterface extends IListing, Document {
  fetchOfferings: () => Promise<OfferingInterface[]>;
  addOffering: (offeringId: string) => Promise<void>;
  removeOffering: (offeringId: string) => Promise<void>;
}
