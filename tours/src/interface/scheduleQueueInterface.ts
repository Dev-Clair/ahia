import { Document } from "mongoose";

export default interface ScheduleQueueInterface extends Document {
  tourId: string;
  proposedDate: Date;
  proposedTime: String;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}
