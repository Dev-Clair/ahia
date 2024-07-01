import { Document } from "mongoose";

export default interface TourIdempotencyInterface extends Document {
  key: string;
  response: any;
  createdAt: Date;
}
