import PromotionInterface from "./promotionInterface";

export default interface PromotionMethodInterface extends PromotionInterface {
  checkPromotionValidity: (date: Date) => boolean;
  reactivatePromotion: (startDate: Date, endDate: Date) => Promise<void>;
}
