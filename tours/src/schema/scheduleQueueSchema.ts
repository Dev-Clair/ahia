import { Schema } from "mongoose";
import ScheduleQueueInterface from "../interface/scheduleQueueInterface";

const ScheduleQueueSchema: Schema<ScheduleQueueInterface> = new Schema({
  tourId: {
    type: String,
    required: true,
  },
  proposedDate: {
    type: Date,
    required: true,
  },
  proposedTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

ScheduleQueueSchema.post("save", async (doc): Promise<void> => {
  if (doc.status === "accepted" || doc.status === "rejected") {
    await doc.deleteOne({ _id: doc._id });
  }
});

export default ScheduleQueueSchema;
