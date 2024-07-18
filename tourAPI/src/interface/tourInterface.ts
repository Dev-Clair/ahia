import { Document } from "mongoose";

export default interface TourInterface extends Document {
  realtor: {
    id: string;
    email: string;
  };
  customer: {
    id: string;
    email: string;
  };
  listingIds: string[];
  scheduled: {
    date: Date;
    time: string;
  };
  status: "pending" | "ongoing" | "completed" | "cancelled";
  isClosed: boolean;
  createdAt: Date;
}
