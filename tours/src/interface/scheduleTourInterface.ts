import { Document } from "mongoose";

export default interface ScheduleTourInterface extends Document {
  tourId: String;
  proposedDate: Date;
  proposedTime: String;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}
