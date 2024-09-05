import { model } from "mongoose";
import ListingModel from "../type/listingmethodType";
import ListingSchema from "../schema/listingSchema";
import ListingInterface from "../interface/listingInterface";

const Listing = model<ListingInterface, ListingModel>("Listing", ListingSchema);

export default Listing;
