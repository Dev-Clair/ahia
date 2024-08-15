import mongoose from "mongoose";
import ScheduleCacheSchema from "../schema/scheduleCache";
import ScheduleCacheInterface from "../interface/scheduleCache";

const Schedule = mongoose.model<ScheduleCacheInterface>(
  "Schedule",
  ScheduleCacheSchema
);
export default Schedule;
