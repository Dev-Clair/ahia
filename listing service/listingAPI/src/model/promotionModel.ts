import { model } from "mongoose";
import PromotionMethodType from "../type/promotionmethodType";
import PromotionSchema from "../schema/promotionSchema";
import PromotionInterface from "../interface/promotionInterface";

const Promotion = model<PromotionInterface, PromotionMethodType>(
  "Promotion",
  PromotionSchema
);

export default Promotion;
