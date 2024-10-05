import { Document, Schema } from "mongoose";

export default interface IPromotion extends Document {
  _id: Schema.Types.ObjectId;
  offerings: Schema.Types.ObjectId[];
  title: string;
  description: string;
  type: "offer" | "discount";
  rate: number;
  startDate: Date;
  endDate: Date;
  media: {
    images?: string[];
    videos?: string[];
  };
}
