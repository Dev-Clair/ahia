import mongoose from "mongoose";
import PromotionSchema from "../schema/promotionSchema";
import PromotionInterface from "../interface/promotionInterface";

const Promotion = mongoose.model<PromotionInterface>(
  "Promotion",
  PromotionSchema
);

export default Promotion;
