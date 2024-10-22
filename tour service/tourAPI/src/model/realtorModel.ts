import { model } from "mongoose";
import IRealtor from "../interface/IRealtor";
import RealtorSchema from "../schema/realtorSchema";

const Realtor = model<IRealtor>("Realtor", RealtorSchema);

export default Realtor;
