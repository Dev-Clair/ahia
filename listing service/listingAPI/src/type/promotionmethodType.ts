import { Model } from "mongoose";
import IPromotion from "../interface/Ipromotion";
import PromotionInterface from "../interface/promotionInterface";

type PromotionInterfaceType = Model<IPromotion, {}, PromotionInterface>;

export default PromotionInterfaceType;
