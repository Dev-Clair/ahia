import { Model } from "mongoose";
import ListingInterface from "../interface/listingInterface";
import ListingMethodInterface from "../interface/listingmethodInterface";

type ListingMethodType = Model<ListingInterface, {}, ListingMethodInterface>;

export default ListingMethodType;
