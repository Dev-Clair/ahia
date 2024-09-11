import { model } from "mongoose";
import ListingInterfaceType from "../type/listinginterfaceType";
import ListingSchema from "../schema/listingSchema";
import IListing from "../interface/IListing";

const Listing = model<IListing, ListingInterfaceType>("Listing", ListingSchema);

export default Listing;
