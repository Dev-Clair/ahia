import { Model } from "mongoose";
import IListing from "../interface/IListing";
import ListingInterface from "../interface/listingInterface";

type ListingInterfaceType = Model<IListing, {}, ListingInterface>;

export default ListingInterfaceType;
