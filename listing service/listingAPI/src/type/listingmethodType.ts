import { Model } from "mongoose";
import ListingInterface from "../interface/listingInterface";
import ListingMethodInterface from "../interface/listingmethodInterface";

type ListingModel = Model<ListingInterface, {}, ListingMethodInterface>;

export default ListingModel;
