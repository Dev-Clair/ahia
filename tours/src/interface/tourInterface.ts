import { Document } from "mongoose";

export default interface TourInterface extends Document {
  realtorId?: String;
  customerId: String;
  listingIds: String[];
  // location: {
  //   type?: String;
  //   coordinates?: Number;
  // };
  scheduledDate?: Date;
  scheduledTime?: String;
  status: "pending" | "ongoing" | "completed" | "cancelled";
  isClosed?: Boolean;
  createdAt: Date;
}
