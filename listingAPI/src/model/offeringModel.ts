import mongoose from "mongoose";
import OfferingSchema from "../schema/offeringSchema";
import OfferingInterface from "../interface/offeringInterface";

const Offering = mongoose.model<OfferingInterface>("Offering", OfferingSchema);

export default Offering;
