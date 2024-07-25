import { Document } from "mongoose";

export default interface ListingIdempotencyInterface extends Document {
  key: string;
  response: any;
  createdAt: Date;
}
