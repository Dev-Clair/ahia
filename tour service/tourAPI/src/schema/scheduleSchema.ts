import { Schema } from "mongoose";
import ISchedule from "../interface/ISchedule";

const ScheduleSchema: Schema<ISchedule> = new Schema(
  {
    tour: {
      type: Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    schedule: {
      date: {
        type: Date,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

export default ScheduleSchema;
