import { Schema } from "mongoose";
import ScheduleCacheInterface from "../interface/scheduleCache";

const ScheduleCacheSchema: Schema<ScheduleCacheInterface> = new Schema({
  tourId: {
    type: String,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default ScheduleCacheSchema;
