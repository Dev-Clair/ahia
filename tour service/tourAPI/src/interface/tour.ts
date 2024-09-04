import { Document } from "mongoose";

export default interface TourInterface extends Document {
  name: string;
  customer: {
    id: string;
    email: string;
  };
  listings: {
    id: string;
    location: {
      type: string;
      coordinates: number[];
    };
  }[];
  location: {
    type: string;
    coordinates: number[];
  };
  realtor: {
    id: string;
    email: string;
  };
  schedule: {
    date: Date;
    time: string;
  };
  status: "pending" | "ongoing" | "completed" | "cancelled";
  isClosed: boolean;
  createdAt: Date;
}
