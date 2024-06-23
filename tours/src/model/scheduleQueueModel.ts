import mongoose from "mongoose";
import ScheduleQueueSchema from "../schema/scheduleQueueSchema";
import ScheduleQueueInterface from "../interface/scheduleQueueInterface";

const ScheduleQueueModel = mongoose.model<ScheduleQueueInterface>(
  "ScheduleQueueModel",
  ScheduleQueueSchema
);
export default ScheduleQueueModel;
