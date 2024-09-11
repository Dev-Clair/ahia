import { model } from "mongoose";
import IPromotion from "../interface/IPromotion";
import PromotionInterfaceType from "../type/promotioninterfaceType";
import PromotionSchema from "../schema/promotionSchema";

const Promotion = model<IPromotion, PromotionInterfaceType>(
  "Promotion",
  PromotionSchema
);

export default Promotion;
