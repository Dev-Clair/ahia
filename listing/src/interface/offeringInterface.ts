import { Document, Schema } from "mongoose";

export default interface OfferingInterface extends Document {
  listing: Schema.Types.ObjectId;
  title: string;
  description: string;
  details: object;
  createdAt: Date;
}
