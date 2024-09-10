import { model } from "mongoose";
import IPromotion from "../interface/Ipromotion";
import PromotionInterfaceType from "../type/promotionmethodType";
import PromotionSchema from "../schema/promotionSchema";

const Promotion = model<IPromotion, PromotionInterfaceType>(
  "Promotion",
  PromotionSchema
);

export default Promotion;
