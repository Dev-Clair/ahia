import { Schema } from "mongoose";
import TourScheduleInterface from "../interface/tourScheduleInterface";

const TourScheduleSchema: Schema<TourScheduleInterface> = new Schema({
  tourId: {
    type: String,
    required: true,
  },
  proposed: {
    date: {
      type: Date,
      required: false,
    },
    time: {
      type: String,
      required: false,
    },
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

TourScheduleSchema.post("save", async (doc): Promise<void> => {
  if (doc.status === "accepted" || doc.status === "rejected") {
    await doc.deleteOne({ _id: doc._id });
  }
});

export default TourScheduleSchema;
