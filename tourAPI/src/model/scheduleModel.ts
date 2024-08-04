import mongoose from "mongoose";
import TourScheduleSchema from "../schema/tourScheduleSchema";
import TourScheduleInterface from "../interface/tourScheduleInterface";

const Schedule = mongoose.model<TourScheduleInterface>(
  "Schedule",
  TourScheduleSchema
);
export default Schedule;
