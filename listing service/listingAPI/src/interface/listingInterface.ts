import { Document, ObjectId } from "mongoose";
import IListing from "./IListing";
import OfferingInterface from "./offeringInterface";

export default interface ListingInterface extends IListing, Document {
  retrieveOfferings: () => Promise<OfferingInterface[]>;
  addOffering: (offeringId: ObjectId) => Promise<void>;
  removeOffering: (offeringId: ObjectId) => Promise<void>;
}
