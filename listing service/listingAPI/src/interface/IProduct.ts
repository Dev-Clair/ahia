import IDocument from "./IDocument";
import { Schema } from "mongoose";
import IOffering from "./IOffering";

export default interface IProduct extends IDocument {
  listing: Schema.Types.ObjectId;
  name: string;
  description: string;
  offering: IOffering;
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
