import { model } from "mongoose";
import OfferingSchema from "../schema/offeringSchema";
import IOffering from "../interface/IOffering";

const Offering = model<IOffering>("Offering", OfferingSchema);

export default Offering;
