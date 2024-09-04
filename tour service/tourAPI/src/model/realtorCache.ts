import mongoose from "mongoose";
import RealtorCacheInterface from "../interface/realtorCache";
import RealtorCacheSchema from "../schema/realtorCache";

const RealtorCache = mongoose.model<RealtorCacheInterface>(
  "RealtorCache",
  RealtorCacheSchema
);

export default RealtorCache;
