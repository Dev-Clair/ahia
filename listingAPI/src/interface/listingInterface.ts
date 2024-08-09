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
    type: string; // "single-room" | "mini-flat" | "2-bedroom-flat" | "3-bedroom-flat" | "duplex" | "semi-detached" | "studio" | "short-lets" | "office" | "shop" | "event-halls" | "bare-land";
    category: "residential" | "commercial" | "mixed";
  };
  features: string[]; // landmark features
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
