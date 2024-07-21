import { Schema } from "mongoose";
import TourScheduleInterface from "../interface/tourScheduleInterface";

const TourScheduleSchema: Schema<TourScheduleInterface> = new Schema({
  tourId: {
    type: String,
    required: true,
  },
  propose: {
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default TourScheduleSchema;
