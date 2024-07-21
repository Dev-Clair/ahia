import { Document } from "mongoose";

export default interface TourRealtorInterface extends Document {
  tourId: string;
  realtor: {
    id: string;
    email: string;
  };
  createdAt: Date;
}
