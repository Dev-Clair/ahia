import { Document, Schema } from "mongoose";
import IProduct from "./IProduct";

export default interface IOffering extends Document {
  _id: Schema.Types.ObjectId;
  id: () => string;
  listing: Schema.Types.ObjectId;
  name: string;
  description: string;
  product: IProduct;
  quantity: number;
  type: "lease" | "reservation" | "sell";
  features: string[];
  area: {
    size: number;
    unit: "sqm" | "sqft";
  };
  media: {
    images: string[];
    videos?: string[];
  };
  promotion: "platinum" | "gold" | "ruby" | "silver";
  verification: {
    status: boolean;
    expiry: Date;
  };
}
