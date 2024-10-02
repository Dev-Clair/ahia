import { Document, Schema } from "mongoose";

export default interface IOffering extends Document {
  listing: Schema.Types.ObjectId;
  name: string;
  slug?: string;
  description: string;
  category: "economy" | "premium" | "luxury";
  features: string[];
  quantity: number;
  area: {
    size: number;
    unit: "sqm" | "sqft";
  };
  type: "lease" | "reservation" | "sell";
  use:
    | "agricultural"
    | "commercial"
    | "industrial"
    | "institutional"
    | "mixed"
    | "residential"
    | "special";
  media: {
    images: string[];
    videos: string[];
  };
  promotion: "none" | "basic" | "plus" | "prime";
  verification: {
    status: boolean;
    expiry: Date;
  };
}
