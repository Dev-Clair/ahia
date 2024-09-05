import { Document, Schema } from "mongoose";

export default interface ListingInterface extends Document {
  name: string;
  description: string;
  slug: string;
  purpose: "lease" | "sell" | "reservation";
  type: "economy" | "premium" | "luxury";
  category: "residential" | "commercial" | "mixed";
  offering: [Schema.Types.ObjectId];
  address: {
    street: string;
    zone: string;
    countyLGA: string;
    state: string;
  };
  location: {
    type: string;
    coordinates: number[];
  };
  provider: {
    id: string;
    email: string;
  };
  status: {
    approved: boolean;
    expiry: Date;
  };
}
