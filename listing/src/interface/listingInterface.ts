import { Document } from "mongoose";

export default interface ListingInterface extends Document {
  name: String;
  description: String;
  slug: String;
  cost: Number;
  purpose: "rent" | "sell";
  type: "developed" | "undeveloped";
  useType:
    | "single-room"
    | "mini-flat"
    | "2 bedroom flat"
    | "3 bedroom flat"
    | "duplex"
    | "semi-detached"
    | "short-lets"
    | "office"
    | "shop"
    | "event halls"
    | "bare-land";

  useCategory: "residential" | "commercial";
  features: String[];
  location: {
    address: String;
    zone: String;
    countyLGA: String;
    state: String;
  };
  attachments: String[];
  provider: String;
  createdAt: Date;
}
