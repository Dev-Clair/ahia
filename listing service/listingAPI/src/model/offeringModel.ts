import { model } from "mongoose";
import IOffering from "../interface/IOffering";
import OfferingSchema from "../schema/offeringSchema";

const Offering = model<IOffering>("Offering", OfferingSchema);

export default Offering;
