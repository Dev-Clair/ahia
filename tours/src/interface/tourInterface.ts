import { Document } from "mongoose";

export default interface TourInterface extends Document {
  realtorId?: string;
  customerId: string;
  listingIds: string[];
  zone: string;
  countyLGA: string;
  country: string;
  scheduledDate?: Date;
  status: "pending" | "completed" | "cancelled";
  createdAt: Date;
}
