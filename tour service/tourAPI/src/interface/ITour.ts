import { Document, Schema } from "mongoose";

export default interface ITour extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  customer: string;
  realtor: string;
  offerings: string[];
  schedule: {
    date: string;
    time: string;
  };
  status: "pending" | "ongoing" | "completed" | "cancelled";
  isClosed: boolean;
}
