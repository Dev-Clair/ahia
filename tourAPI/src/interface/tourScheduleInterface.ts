import { Document } from "mongoose";

export default interface TourScheduleInterface extends Document {
  tourId: string;
  propose: {
    date: Date;
    time: string;
  };
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}
