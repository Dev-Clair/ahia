import mongoose from "mongoose";
import ListingSchema from "../schema/listingSchema";
import ListingInterface from "../interface/listingInterface";

const Listing = mongoose.model<ListingInterface>("Listing", ListingSchema);

export default Listing;
