import mongoose from "mongoose";
import RealtorCacheInterface from "../interface/realtorCache";
import RealtorCacheSchema from "../schema/realtorCache";

const Realtor = mongoose.model<RealtorCacheInterface>(
  "Realtor",
  RealtorCacheSchema
);

export default Realtor;
