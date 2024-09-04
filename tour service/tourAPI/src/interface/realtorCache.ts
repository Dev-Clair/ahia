import { Document } from "mongoose";

export default interface RealtorCacheInterface extends Document {
  tourId: string;
  realtor: {
    id: string;
    email: string;
  };
  createdAt: Date;
}
