import { Schema } from "mongoose";
import PromotionInterface from "../interface/Ipromotion";
import PromotionMethodType from "../type/promotionmethodType";
import PromotionMethodInterface from "../interface/promotionInterface";

const PromotionSchema: Schema<
  PromotionInterface,
  PromotionMethodType,
  PromotionMethodInterface
> = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    listings: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      default: undefined,
    },
    offerings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Offering",
        default: undefined,
      },
    ],
  },
  { timestamps: true }
);

// Promotion Schema Search Query Index
PromotionSchema.index({ startDate: 1, endDate: 1 });

// Promotion Schema Instance Methods
PromotionSchema.method(
  "checkPromotionValidity",
  function checkPromotionValidity(date: Date = new Date()): boolean {
    return this.startDate <= date && this.endDate >= date;
  }
);

PromotionSchema.method(
  "reactivatePromotion",
  async function reactivatePromotion(
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    this.startDate = this.startDate <= startDate ? startDate : this.startDate;

    this.endDate = this.endDate <= endDate ? endDate : this.endDate;

    if (this.startDate === startDate && this.endDate === endDate)
      await this.save();

    throw new Error("Invalid Arguments Exception");
  }
);

export default PromotionSchema;
