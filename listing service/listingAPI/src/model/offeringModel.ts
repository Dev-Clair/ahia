import { model } from "mongoose";
import OfferingSchema from "../schema/offeringSchema";
import OfferingInterface from "../interface/offeringInterface";

const Offering = model<OfferingInterface>("Offering", OfferingSchema);

export default Offering;
