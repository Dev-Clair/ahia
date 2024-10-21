import IDocument from "./IDocument";
import { Schema } from "mongoose";
import IProduct from "./IProduct";

export default interface IOffering extends IDocument {
  listing: Schema.Types.ObjectId;
  name: string;
  description: string;
  product: IProduct;
  type: "lease" | "reservation" | "sell";
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
