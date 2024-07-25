import { Schema } from "mongoose";
import PromotionInterface from "../interface/promotionInterface";

const PromotionSchema: Schema<PromotionInterface> = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  title: {
    type: String,
    trim: true,
    required: true,
  },
  type: {
    type: String,
    enum: ["discount", "coupon", "seasonal", "bundle"],
    required: true,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  terms: {
    type: String,
    trim: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default PromotionSchema;
