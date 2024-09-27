import { Document, Schema } from "mongoose";

export default interface IPromotion extends Document {
  title: string;
  description: string;
  promotionType: "offer" | "discount";
  rate: number;
  startDate: Date;
  endDate: Date;
  media: {
    images: string[];
    videos: string[];
  };
  listings: Schema.Types.ObjectId[];
}
