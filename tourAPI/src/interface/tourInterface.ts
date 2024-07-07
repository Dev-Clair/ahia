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
  scheduledDate: Date;
  scheduledTime: string;
  status: "pending" | "ongoing" | "completed" | "cancelled";
  isClosed: boolean;
  createdAt: Date;
}

// location: {
//   type?: String;
//   coordinates?: Number;
// };
