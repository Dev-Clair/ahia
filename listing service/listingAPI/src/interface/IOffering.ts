import { Document, Schema } from "mongoose";
import ISpace from "./ISpace";

export default interface IOffering extends Document {
  _id: Schema.Types.ObjectId;
  listing: Schema.Types.ObjectId;
  promotion?: Schema.Types.ObjectId;
  name: string;
  slug?: string;
  description: string;
  category: "economy" | "premium" | "luxury";
  space: ISpace;
  type: "lease" | "reservation" | "sell";
  features: string[];
  quantity: number;
  area: {
    size: number;
    unit: "sqm" | "sqft";
  };
  media: {
    images: string[];
    videos?: string[];
  };
  verification: {
    status: boolean;
    expiry: Date;
  };
}
