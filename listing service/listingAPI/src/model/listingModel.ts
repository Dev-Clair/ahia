import { model } from "mongoose";
import ListingMethodType from "../type/listingmethodType";
import ListingSchema from "../schema/listingSchema";
import ListingInterface from "../interface/listingInterface";

const Listing = model<ListingInterface, ListingMethodType>(
  "Listing",
  ListingSchema
);

export default Listing;
