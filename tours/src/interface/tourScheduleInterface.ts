import { Document } from "mongoose";

export default interface TourScheduleInterface extends Document {
  tourId: String;
  proposedDate: Date;
  proposedTime: String;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}
