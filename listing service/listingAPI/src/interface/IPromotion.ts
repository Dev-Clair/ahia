import { Schema } from "mongoose";

export default interface IPromotion {
  type: string;
  description: string;
  discount: number;
  startDate: Date;
  endDate: Date;
  media: {
    picture: string[];
    video: string[];
  };
  listing?: Schema.Types.ObjectId;
  offerings: Schema.Types.ObjectId[];
}
