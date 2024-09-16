import { model } from "mongoose";
import IListing from "../interface/IListing";
import ListingSchema from "../schema/listingSchema";

const Listing = model<IListing>("Listing", ListingSchema);

export default Listing;
