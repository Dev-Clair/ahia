import { Document, Schema } from "mongoose";

export default interface PromotionInterface extends Document {
  listing: Schema.Types.ObjectId;
  title: string;
  description: string;
  type: "discount" | "coupon" | "seasonal" | "bundle";
  discount: number;
  startDate: Date;
  endDate: Date;
  terms: string;
}
