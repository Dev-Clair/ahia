import { Model } from "mongoose";
import IPromotion from "../interface/IPromotion";
import PromotionInterface from "../interface/promotionInterface";

type PromotionInterfaceType = Model<IPromotion, {}, PromotionInterface>;

export default PromotionInterfaceType;
