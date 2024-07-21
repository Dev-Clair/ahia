import { Document } from "mongoose";

export default interface TourRequestInterface extends Document {
  tourId: string;
  realtor: {
    id: string;
    email: string;
  };
  createdAt: Date;
}
