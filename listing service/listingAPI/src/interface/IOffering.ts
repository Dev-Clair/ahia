import { Document, Schema } from "mongoose";

export default interface IOffering extends Document {
  listing: Schema.Types.ObjectId;
  offeringType: string;
  offeringCategory: "economy" | "premium" | "luxury";
  slug?: string;
  unitsAvailable: number;
  averageArea: {
    size: number;
    unit: "sqm" | "sqft";
  };
  averagePrice: {
    amount: number;
    currency: string;
  };
  features: string[];
  status: "open" | "closed";
  media: {
    images: string[];
    videos: string[];
  };
  featured: {
    status: true | false;
    type: "basic" | "plus" | "prime";
  };
}
