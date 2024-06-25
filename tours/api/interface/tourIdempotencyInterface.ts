import { Document } from "mongoose";

export default interface TourIdempotencyInterface extends Document {
  key: String;
  response: any;
  createdAt: Date;
}
