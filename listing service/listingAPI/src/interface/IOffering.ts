import { Document, Schema } from "mongoose";

export default interface IOffering extends Document {
  listing: Schema.Types.ObjectId;
  name: string;
  offeringType: "lease" | "reservation" | "sell";
  offeringCategory: "economy" | "premium" | "luxury";
  slug?: string;
  quantity: number;
  area: {
    size: number;
    unit: "sqm" | "sqft";
  };
  amenities: string[];
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
