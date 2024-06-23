import mongoose from "mongoose";
import ScheduleTourSchema from "../schema/scheduleTourSchema";
import ScheduleTourInterface from "../interface/scheduleTourInterface";

const ScheduleTourModel = mongoose.model<ScheduleTourInterface>(
  "ScheduleTourModel",
  ScheduleTourSchema
);
export default ScheduleTourModel;
