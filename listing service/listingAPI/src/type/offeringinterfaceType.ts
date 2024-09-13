import { Model } from "mongoose";
import IOffering from "../interface/IOffering";
import OfferingInterface from "../interface/offeringInterface";

type OfferingInterfaceType = Model<IOffering, {}, OfferingInterface>;

export default OfferingInterfaceType;
