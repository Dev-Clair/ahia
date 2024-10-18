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
        type: String,
        required: true,
        validate: {
          validator: (value: string) => !isNaN(Date.parse(value)),
          message: "Invalid date string",
        },
      },
      time: {
        type: String,
        required: true,
        validate: {
          validator: (value: string) => /^\d{2}:\d{2}$/.test(value),
          message: "Invalid time string",
        },
      },
    },
  },
  { timestamps: true }
);

export default ScheduleSchema;
