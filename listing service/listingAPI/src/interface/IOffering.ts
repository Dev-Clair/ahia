import { Schema } from "mongoose";

export default interface IOffering {
  name: string;
  slug?: string;
  offeringType: string;
  area: {
    size?: number;
    unit?: "sqm" | "sqft";
  };
  price: {
    amount: number;
    currency: string;
  };
  features: string[];
  status: "open" | "closed";
  media: {
    images: string[];
    videos: string[];
  };
  listing: Schema.Types.ObjectId;
  promotion: Schema.Types.ObjectId;
}
