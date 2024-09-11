import { Document, ObjectId } from "mongoose";
import IListing from "./IListing";
import IOffering from "./IOffering";

export default interface ListingInterface extends IListing, Document {
  fetchOfferings: () => Promise<IOffering[]>;
  addOffering: (offeringId: ObjectId) => Promise<void>;
  removeOffering: (offeringId: ObjectId) => Promise<void>;
}
