import { Document } from "mongoose";

export default interface ScheduleCacheInterface extends Document {
  tourId: string;
  schedule: {
    date: Date;
    time: string;
  };
  createdAt: Date;
}
