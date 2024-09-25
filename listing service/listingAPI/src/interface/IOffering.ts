import { Document, Schema } from "mongoose";

export default interface IOffering extends Document {
  listing: Schema.Types.ObjectId;
  name: string;
  slug?: string;
  quantity: number;
  area: {
    size: number;
    unit: "sqm" | "sqft";
  };
  category: "economy" | "premium" | "luxury";
  status: "open" | "closed";
  type: "lease" | "reservation" | "sell";
  // use:
  //   | "residential"
  //   | "commercial"
  //   | "industrial"
  //   | "agricultural"
  //   | "special"
  //   | "mixed";
  amenities: string[];
  media: {
    images: string[];
    videos: string[];
  };
  featured: {
    status: true | false;
    type: "basic" | "plus" | "prime";
  };
}
