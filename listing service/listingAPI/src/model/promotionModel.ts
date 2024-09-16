import { model } from "mongoose";
import IPromotion from "../interface/IPromotion";
import PromotionSchema from "../schema/promotionSchema";

const Promotion = model<IPromotion>("Promotion", PromotionSchema);

export default Promotion;
