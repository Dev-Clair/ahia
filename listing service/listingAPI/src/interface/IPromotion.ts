import { Schema } from "mongoose";

export default interface IPromotion {
  promotionType: string;
  description: string;
  discount: number;
  startDate: Date;
  endDate: Date;
  media: {
    images: string[];
    videos: string[];
  };
  listings: Schema.Types.ObjectId[];
  offerings: Schema.Types.ObjectId[];
}
