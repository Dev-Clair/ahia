import { Schema } from "mongoose";

export default interface IPromotion {
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
  offerings: Schema.Types.ObjectId[];
}
