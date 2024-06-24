import { Document } from "mongoose";

export default interface TourScheduleInterface extends Document {
  tourId: String;
  proposed: {
    date?: Date;
    time?: String;
  };
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}
