import { Document } from "mongoose";

export default interface ListingInterface extends Document {
  name: string;
  description: string;
  slug: string;
  cost: number;
  purpose: "lease" | "sell";
  type: "on-going" | "now-selling";
  category: "economy" | "premium" | "luxury";
  use: {
    type: string;
    category: "residential" | "commercial" | "mixed";
  };
  features: string[];
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
    id: string;
    approved: boolean;
    expiry: Date;
  };
}
