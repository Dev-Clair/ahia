import { Document } from "mongoose";

export default interface TourInterface extends Document {
  name: string;
  realtor: {
    id: string;
    email: string;
  };
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
  schedule: {
    date: Date;
    time: string;
  };
  status: "pending" | "ongoing" | "completed" | "cancelled";
  isClosed: boolean;
  createdAt: Date;
}
