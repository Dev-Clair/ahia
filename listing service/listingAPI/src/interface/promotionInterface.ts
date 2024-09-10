import { Document } from "mongoose";
import IPromotion from "./Ipromotion";

export default interface PromotionInterface extends IPromotion, Document {
  checkPromotionValidity: (date: Date) => boolean;
  reactivatePromotion: (startDate: Date, endDate: Date) => Promise<void>;
}
