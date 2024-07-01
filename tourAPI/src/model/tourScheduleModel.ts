import mongoose from "mongoose";
import TourScheduleSchema from "../schema/tourScheduleSchema";
import TourScheduleInterface from "../interface/tourScheduleInterface";

const TourSchedule = mongoose.model<TourScheduleInterface>(
  "TourSchedule",
  TourScheduleSchema
);
export default TourSchedule;
