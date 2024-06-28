import { Schema } from "mongoose";
import TourScheduleInterface from "../interface/tourScheduleInterface";

const TourScheduleSchema: Schema<TourScheduleInterface> = new Schema({
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
    default: Date.now,
  },
});

TourScheduleSchema.post("save", async (doc, next): Promise<void> => {
  if (doc.status === "accepted" || doc.status === "rejected") {
    await doc.deleteOne({ _id: doc._id }).catch((err) => next(err));
  }

  next();
});

export default TourScheduleSchema;
