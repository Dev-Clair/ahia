import { Document } from "mongoose";

export default interface TourScheduleInterface extends Document {
  tourId: string;
  proposedDate: Date;
  proposedTime: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}
