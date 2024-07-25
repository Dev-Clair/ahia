import { Document } from "mongoose";

export default interface ListingInterface extends Document {
  name: string;
  description: string;
  slug: string;
  cost: number;
  purpose: "rent" | "sell";
  type: "developed" | "undeveloped";
  use: {
    type:
      | "single-room"
      | "mini-flat"
      | "2-bedroom-flat"
      | "3-bedroom-flat"
      | "duplex"
      | "semi-detached"
      | "short-lets"
      | "office"
      | "shop"
      | "event-halls"
      | "bare-land";
    category: "residential" | "commercial";
  };
  features: string[];
  address: {
    street: string;
    zone: string;
    countyLGA: string;
    state: string;
  };
  location: {
    type?: string;
    coordinates?: number;
  };
  attachments: string[];
  provider: string;
  createdAt: Date;
}
