import { Document, Schema } from "mongoose";

export default interface ListingInterface extends Document {
  name: string;
  description: string;
  slug: string;
  cost: number;
  purpose: "rent" | "sell";
  type: "developed" | "ongoing" | "undeveloped";
  category: "economy" | "premium" | "luxury";
  use: {
    type: string; // "single-room" | "mini-flat" | "2-bedroom-flat" | "3-bedroom-flat" | "duplex" | "semi-detached" | "studio" | "short-lets" | "office" | "shop" | "event-halls" | "bare-land";
    category: "residential" | "commercial";
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
  promotion: Schema.Types.ObjectId[];
  attachment: Schema.Types.ObjectId[];
  provider: string;
  createdAt: Date;
  reference: {
    id: string;
    status: string;
    expiry: Date;
  };
}
