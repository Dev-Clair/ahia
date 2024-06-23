import mongoose from "mongoose";
import TourScheduleSchema from "../schema/tourScheduleSchema";
import TourScheduleInterface from "../interface/tourScheduleInterface";

const TourScheduleModel = mongoose.model<TourScheduleInterface>(
  "TourScheduleModel",
  TourScheduleSchema
);
export default TourScheduleModel;
