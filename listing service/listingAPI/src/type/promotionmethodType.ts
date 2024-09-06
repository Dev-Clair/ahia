import { Model } from "mongoose";
import PromotionInterface from "../interface/promotionInterface";
import PromotionMethodInterface from "../interface/promotionmethodInterface";

type PromotionMethodType = Model<
  PromotionInterface,
  {},
  PromotionMethodInterface
>;

export default PromotionMethodType;
