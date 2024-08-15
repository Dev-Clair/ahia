import mongoose from "mongoose";
import ScheduleCacheSchema from "../schema/scheduleCache";
import ScheduleCacheInterface from "../interface/scheduleCache";

const ScheduleCache = mongoose.model<ScheduleCacheInterface>(
  "ScheduleCache",
  ScheduleCacheSchema
);
export default ScheduleCache;
